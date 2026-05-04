import { ArrowLeft, BookOpen, Check, House, Info, PlayCircle, Save, Search, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ExerciseVideo from './ExerciseVideo'
import { saveCustomWorkoutSynced } from '../lib/customWorkouts'
import { writeBuilderWorkoutStorage } from '../lib/builderWorkoutStorage'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import {
  localizeExerciseName,
  localizeExerciseZone,
  localizeMusclesText,
  localizeTechniqueText,
} from '../lib/exerciseTextLocalization'

export type BuilderExerciseTag = 'Main exercise' | 'Accessory' | 'Isolation' | 'Cardio' | 'Core exercise'
export type ExerciseLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface BuilderExercise {
  id?: string
  name: string
  icon?: string
  tag: BuilderExerciseTag
  levels?: ExerciseLevel[]
  zone?: string
  sets?: string
  reps?: string
  videoUrl?: string
  muscles?: string
  technique?: string
}

interface BuilderGroup {
  title: string
  exercises: BuilderExercise[]
}

interface GuidedPhase {
  key: string
  title: string
  hint: string
  exercises: Array<BuilderExercise & { id: string }>
}

interface ExerciseBuilderScreenProps {
  title: string
  subtitle: string
  backTo: string
  groups: BuilderGroup[]
  trainingPath: string
  storageKey: string
  modePreset: 'fat-loss' | 'tone'
  useGuidedFullBodyFlow?: boolean
  useGuidedSplitFlow?: boolean
}

const tagClasses: Record<BuilderExerciseTag, string> = {
  'Main exercise': 'bg-[#e8e8e8] text-[#111111] border-[#d4d4d8]',
  Accessory: 'bg-[#efefef] text-[#111111] border-[#d4d4d8]',
  Isolation: 'bg-[#f2f2f2] text-[#111111] border-[#d4d4d8]',
  Cardio: 'bg-[#111111] text-white border-[#111111]',
  'Core exercise': 'bg-[#f1f7e6] text-[#111111] border-[#d4d4d8]',
}

const levelDotClass: Record<ExerciseLevel, string> = {
  Beginner: 'bg-emerald-500',
  Intermediate: 'bg-sky-500',
  Advanced: 'bg-red-500',
}

const buildExerciseId = (groupTitle: string, exerciseName: string, index: number) => {
  return `${groupTitle}-${exerciseName}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}

const createUuid = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  const getRandomHex = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16)
      crypto.getRandomValues(bytes)
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    }

    let hex = ''
    for (let index = 0; index < 32; index += 1) {
      hex += Math.floor(Math.random() * 16).toString(16)
    }
    return hex
  }

  const raw = getRandomHex()
  const part1 = raw.slice(0, 8)
  const part2 = raw.slice(8, 12)
  const part3 = `4${raw.slice(13, 16)}`
  const variantNibble = (parseInt(raw.slice(16, 17), 16) & 0x3) | 0x8
  const part4 = `${variantNibble.toString(16)}${raw.slice(17, 20)}`
  const part5 = raw.slice(20, 32)

  return `${part1}-${part2}-${part3}-${part4}-${part5}`
}

const normalizeGuideExerciseName = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

const isDeadliftGuideExercise = (exerciseName: string) => {
  const normalized = normalizeGuideExerciseName(exerciseName)
  return normalized.includes('deadlift') || normalized.includes('rdl') || normalized.includes('good mornings')
}

const pressGuideExercises = new Set([
  normalizeGuideExerciseName('Barbell Bench Press'),
  normalizeGuideExerciseName('Dumbbell Bench Press'),
  normalizeGuideExerciseName('Incline Barbell Bench Press'),
  normalizeGuideExerciseName('Incline Dumbbell Bench Press'),
  normalizeGuideExerciseName('Incline Chest Press Machine'),
  normalizeGuideExerciseName('Decline Barbell Bench Press'),
  normalizeGuideExerciseName('Decline Dumbbell Bench Press'),
  normalizeGuideExerciseName('Close-Grip Bench Press'),
])

const isPressGuideExercise = (exerciseName: string) => {
  return pressGuideExercises.has(normalizeGuideExerciseName(exerciseName))
}

const pushUpGuideExercises = new Set([
  normalizeGuideExerciseName('Push-Ups'),
  normalizeGuideExerciseName('Knee Push-Ups'),
  normalizeGuideExerciseName('Incline Push-Ups'),
  normalizeGuideExerciseName('Decline Push-Ups'),
  normalizeGuideExerciseName('Dips (Chest Focus)'),
])

const isPushUpGuideExercise = (exerciseName: string) => {
  return pushUpGuideExercises.has(normalizeGuideExerciseName(exerciseName))
}

const chestFlyGuideExercises = new Set([
  normalizeGuideExerciseName('Cable Chest Fly (Flat)'),
  normalizeGuideExerciseName('Decline Cable Fly'),
  normalizeGuideExerciseName('Incline Cable Fly'),
  normalizeGuideExerciseName('Pec Deck Machine'),
])

const isChestFlyGuideExercise = (exerciseName: string) => {
  return chestFlyGuideExercises.has(normalizeGuideExerciseName(exerciseName))
}

const baseRowGuideExercises = new Set([
  normalizeGuideExerciseName('Straight-arm Pulldown (rope)'),
  normalizeGuideExerciseName('Face Pulls'),
  normalizeGuideExerciseName('High Row (cable)'),
  normalizeGuideExerciseName('Seal Row'),
  normalizeGuideExerciseName('Chest-supported Dumbbell Row'),
])

const isBaseRowGuideExercise = (exerciseName: string) => {
  return baseRowGuideExercises.has(normalizeGuideExerciseName(exerciseName))
}

const pullUpGuideExercises = new Set([
  normalizeGuideExerciseName('Pull-ups'),
  normalizeGuideExerciseName('Close-Grip Pull-Ups'),
  normalizeGuideExerciseName('Neutral-Grip Pull-Ups'),
  normalizeGuideExerciseName('Chin-ups'),
  normalizeGuideExerciseName('Assisted Pull-ups (machine)'),
  normalizeGuideExerciseName('Inverted Rows'),
])

const isPullUpGuideExercise = (exerciseName: string) => {
  return pullUpGuideExercises.has(normalizeGuideExerciseName(exerciseName))
}

const legPressGuideExercises = new Set([
  normalizeGuideExerciseName('Leg Press'),
  normalizeGuideExerciseName('Horizontal Leg Press'),
  normalizeGuideExerciseName('Vertical Leg Press'),
])

const isLegPressGuideExercise = (exerciseName: string) => {
  return legPressGuideExercises.has(normalizeGuideExerciseName(exerciseName))
}

const guideChoiceAliasToCanonical: Record<string, string> = {
  [normalizeGuideExerciseName('Romanian Deadlift')]: 'Romanian Deadlift with dumbbell/barbell',
  [normalizeGuideExerciseName('Deadlift')]: 'Deadlift with dumbbell/barbell/Smith',
  [normalizeGuideExerciseName('Light Good Morning')]: 'Good Morning',
  [normalizeGuideExerciseName('Good Morning (с лёгким весом)')]: 'Good Morning',
  [normalizeGuideExerciseName('Классическая становая тяга')]: 'Deadlift with dumbbell/barbell/Smith',
  [normalizeGuideExerciseName('Румынская тяга')]: 'Romanian Deadlift with dumbbell/barbell',
  [normalizeGuideExerciseName('Тяга на прямых ногах')]: 'Stiff-Leg Deadlift',
  [normalizeGuideExerciseName('Тяга с лёгким весом')]: 'Romanian Deadlift with dumbbell/barbell',
  [normalizeGuideExerciseName('Incline Machine Press')]: 'Incline Chest Press Machine',
  [normalizeGuideExerciseName('Standard Push-Ups')]: 'Push-Ups',
  [normalizeGuideExerciseName('Dips')]: 'Dips (Chest Focus)',
  [normalizeGuideExerciseName('Отжимания от пола')]: 'Push-Ups',
  [normalizeGuideExerciseName('Отжимания на брусьях')]: 'Dips (Chest Focus)',
  [normalizeGuideExerciseName('Cable Fly (horizontal)')]: 'Cable Chest Fly (Flat)',
  [normalizeGuideExerciseName('Low-to-High Cable Fly')]: 'Incline Cable Fly',
  [normalizeGuideExerciseName('High-to-Low Cable Fly')]: 'Decline Cable Fly',
  [normalizeGuideExerciseName('Cable Fly (any angle)')]: 'Cable Chest Fly (Flat)',
  [normalizeGuideExerciseName('Сведение рук в кроссовере под наклоном (снизу вверх)')]: 'Incline Cable Fly',
  [normalizeGuideExerciseName('Сведение рук в кроссовере с отрицательным наклоном (сверху вниз)')]: 'Decline Cable Fly',
  [normalizeGuideExerciseName('Сведение рук в кроссовере (любой угол)')]: 'Cable Chest Fly (Flat)',
  [normalizeGuideExerciseName('Wide-Grip Lat Pulldown')]: 'Lat Pulldown (wide grip)',
  [normalizeGuideExerciseName('Close-Grip Lat Pulldown')]: 'Lat Pulldown (close grip)',
  [normalizeGuideExerciseName('Reverse-Grip Lat Pulldown')]: 'Underhand Lat Pulldown',
  [normalizeGuideExerciseName('Any Lat Pulldown variation')]: 'Lat Pulldown (wide grip)',
  [normalizeGuideExerciseName('Любая тяга верхнего блока')]: 'Lat Pulldown (wide grip)',
  [normalizeGuideExerciseName('Straight-Arm Cable Pulldown (rope)')]: 'Straight-arm Pulldown (rope)',
  [normalizeGuideExerciseName('High Cable Row')]: 'High Row (cable)',
  [normalizeGuideExerciseName('Chest-Supported Row')]: 'Chest-supported Dumbbell Row',
  [normalizeGuideExerciseName('Incline Bench Row')]: 'Seal Row',
  [normalizeGuideExerciseName('Австралийские подтягивания')]: 'Inverted Rows',
  [normalizeGuideExerciseName('Подтягивания в гравитроне')]: 'Assisted Pull-ups (machine)',
  [normalizeGuideExerciseName('Подтягивания прямым хватом')]: 'Pull-ups',
  [normalizeGuideExerciseName('Подтягивания параллельным хватом')]: 'Neutral-Grip Pull-Ups',
  [normalizeGuideExerciseName('Подтягивания обратным хватом')]: 'Chin-ups',
  [normalizeGuideExerciseName('Подтягивания узким хватом')]: 'Close-Grip Pull-Ups',
  [normalizeGuideExerciseName('Подтягивания с собственным весом (разные хваты)')]: 'Pull-ups',
  [normalizeGuideExerciseName('Australian Pull-Ups (Inverted Rows)')]: 'Inverted Rows',
  [normalizeGuideExerciseName('Australian Pull-Ups')]: 'Inverted Rows',
  [normalizeGuideExerciseName('Assisted Pull-Ups (machine)')]: 'Assisted Pull-ups (machine)',
  [normalizeGuideExerciseName('Assisted Pull-Ups')]: 'Assisted Pull-ups (machine)',
  [normalizeGuideExerciseName('Pull-Ups (overhand grip)')]: 'Pull-ups',
  [normalizeGuideExerciseName('Chin-Ups (underhand grip)')]: 'Chin-ups',
  [normalizeGuideExerciseName('Pull-Ups with bodyweight (different grips)')]: 'Pull-ups',
  [normalizeGuideExerciseName('Жим ногами (классический под углом ~45°)')]: 'Leg Press',
  [normalizeGuideExerciseName('Классический жим ногами (45°)')]: 'Leg Press',
  [normalizeGuideExerciseName('Классический жим ногами')]: 'Leg Press',
  [normalizeGuideExerciseName('45-Degree Leg Press')]: 'Leg Press',
  [normalizeGuideExerciseName('45 degree leg press')]: 'Leg Press',
}

type ExerciseGuideSection = {
  title: string
  choose: string[]
  why?: string
  focus: string
}

const deadliftGuideContent: Record<'ru' | 'en', { title: string; sections: ExerciseGuideSection[]; quickTitle: string; quickLines: string[] }> = {
  ru: {
    title: 'Как выбрать тягу под цель?',
    sections: [
      {
        title: '🔹 Ягодицы',
        choose: ['Румынская тяга', 'Good Morning'],
        why: 'максимальное движение из тазобедренного сустава',
        focus: 'Таз назад + сжатие ягодиц вверху',
      },
      {
        title: '🔹 Задняя поверхность бедра',
        choose: ['Румынская тяга', 'Тяга на прямых ногах'],
        why: 'максимальное растяжение мышц',
        focus: 'Чувствовать натяжение, а не глубину',
      },
      {
        title: '🔹 Общая сила и масса',
        choose: ['Классическая становая тяга'],
        why: 'включает всё тело',
        focus: 'Толкай пол ногами',
      },
      {
        title: '🔹 Новичок / техника',
        choose: ['Румынская тяга', 'Тяга с лёгким весом'],
        why: 'проще контролировать движение',
        focus: 'Сначала таз назад, потом наклон',
      },
      {
        title: '🔹 Безопасность спины',
        choose: ['Румынская тяга', 'Good Morning (с лёгким весом)'],
        why: 'меньше нагрузки на поясницу при контроле',
        focus: 'Нейтральная спина всегда',
      },
      {
        title: '🔹 Альтернатива / функциональная сила',
        choose: ['Тяга Джефферсона', 'Становая тяга рывковым хватом'],
        why: 'нестандартные варианты развивают силу, координацию и усиливают нагрузку на спину и заднюю цепь',
        focus: 'Контроль корпуса + стабильная спина + полная амплитуда 💪',
      },
      {
        title: '🔹 Сумо (акцент на ягодицы и внутреннюю поверхность бедра)',
        choose: ['Становая тяга сумо'],
        why: 'широкая постановка ног смещает нагрузку на ягодицы и внутреннюю поверхность бедра',
        focus: 'Колени в стороны + спина ровная + толчок через пятки 💪',
      },
    ],
    quickTitle: '🔑 Быстрый ориентир',
    quickLines: [
      'хочешь ягодицы → RDL',
      'хочешь заднюю поверхность → RDL / Stiff-leg',
      'хочешь силу → Deadlift',
      'новичок → RDL',
    ],
  },
  en: {
    title: 'How to Choose the Right Deadlift',
    sections: [
      {
        title: '🔹 Glutes',
        choose: ['Romanian Deadlift', 'Good Morning'],
        focus: 'Hips back + squeeze at the top',
      },
      {
        title: '🔹 Hamstrings',
        choose: ['Romanian Deadlift', 'Stiff-Leg Deadlift'],
        focus: 'Feel the stretch, not the depth',
      },
      {
        title: '🔹 Strength & Mass',
        choose: ['Deadlift'],
        focus: 'Push the floor away',
      },
      {
        title: '🔹 Beginner / Technique',
        choose: ['Romanian Deadlift'],
        focus: 'Hips back first',
      },
      {
        title: '🔹 Back Safety',
        choose: ['Romanian Deadlift', 'Light Good Morning'],
        focus: 'Keep a neutral spine',
      },
      {
        title: '🔹 Alternative / Functional Strength',
        choose: ['Jefferson Deadlift', 'Snatch-Grip Deadlift'],
        why: 'These variations improve strength, coordination, and increase posterior chain and upper back engagement',
        focus: 'Core control + stable spine + full range of motion 💪',
      },
      {
        title: '🔹 Sumo (Glutes & Inner Thigh Focus)',
        choose: ['Sumo Deadlift'],
        why: 'The wide stance shifts emphasis to the glutes and inner thighs',
        focus: 'Knees out + neutral spine + drive through heels 💪',
      },
    ],
    quickTitle: '🔑 Quick guide',
    quickLines: ['glutes → RDL', 'hamstrings → RDL / Stiff-leg', 'strength → Deadlift', 'beginner → RDL'],
  },
}

const pressGuideContent: Record<'ru' | 'en', { title: string; sections: ExerciseGuideSection[]; quickTitle: string; quickLines: string[]; shortTitle: string[] }> = {
  ru: {
    title: 'Как выбрать жим под себя',
    sections: [
      {
        title: '🔹 Общая грудь (база)',
        choose: ['Жим штанги лёжа', 'Жим гантелей лёжа'],
        why: 'штанга → больше вес, сила; гантели → больше амплитуда и контроль',
        focus: 'Контроль + стабильность корпуса',
      },
      {
        title: '🔹 Верх груди',
        choose: ['Жим штанги на наклонной скамье', 'Жим гантелей на наклонной скамье', 'Наклонный жим в тренажёре'],
        why: 'штанга → сила; гантели → баланс и растяжение; тренажёр → контроль и безопасность',
        focus: 'Не уводите нагрузку в плечи',
      },
      {
        title: '🔹 Низ груди',
        choose: ['Жим штанги на скамье с отрицательным уклоном', 'Жим гантелей на скамье с отрицательным уклоном'],
        why: 'штанга → стабильность и вес; гантели → больше амплитуда и сокращение',
        focus: 'Контроль + работа в нижней части груди',
      },
      {
        title: '🔹 Трицепс',
        choose: ['Жим лёжа узким хватом'],
        focus: 'Локти ближе к корпусу',
      },
      {
        title: '🔹 Новичок / безопасность',
        choose: ['Жим гантелей лёжа', 'Наклонный жим в тренажёре'],
        why: 'проще контролировать движение',
        focus: 'Стабильность и техника',
      },
      {
        title: '🔹 Максимальный вес / сила',
        choose: ['Жим штанги лёжа'],
        focus: 'Постепенное увеличение веса',
      },
    ],
    quickTitle: '🔑 Быстрый ориентир',
    quickLines: ['база → штанга лёжа', 'верх → наклон вверх', 'низ → наклон вниз', 'трицепс → узкий хват', 'контроль → гантели / тренажёр'],
    shortTitle: ['👉 штанга = сила', '👉 гантели = контроль и амплитуда', '👉 тренажёр = безопасность', '👉 наклон вверх = верх груди', '👉 наклон вниз = низ груди', '👉 узкий хват = трицепс'],
  },
  en: {
    title: 'How to Choose the Right Press',
    sections: [
      {
        title: '🔹 Overall Chest (Base)',
        choose: ['Barbell Bench Press', 'Dumbbell Bench Press'],
        why: 'barbell → more weight, strength; dumbbells → more range of motion and control',
        focus: 'Control + stability',
      },
      {
        title: '🔹 Upper Chest',
        choose: ['Incline Barbell Bench Press', 'Incline Dumbbell Bench Press', 'Incline Machine Press'],
        why: 'barbell → strength; dumbbells → balance and stretch; machine → control and safety',
        focus: 'Keep tension in the chest, not shoulders',
      },
      {
        title: '🔹 Lower Chest',
        choose: ['Decline Barbell Bench Press', 'Decline Dumbbell Bench Press'],
        why: 'barbell → stability and load; dumbbells → greater range and contraction',
        focus: 'Control + lower chest engagement',
      },
      {
        title: '🔹 Triceps',
        choose: ['Close-Grip Bench Press'],
        focus: 'Keep elbows close to your body',
      },
      {
        title: '🔹 Beginner / Safety',
        choose: ['Dumbbell Bench Press', 'Incline Machine Press'],
        why: 'easier to control and stabilize',
        focus: 'smooth, controlled movement',
      },
      {
        title: '🔹 Strength / Maximum Load',
        choose: ['Barbell Bench Press'],
        focus: 'progressive overload',
      },
    ],
    quickTitle: '🔑 Quick guide',
    quickLines: ['base → flat bench', 'upper chest → incline', 'lower chest → decline', 'triceps → close grip', 'control → dumbbells / machine'],
    shortTitle: ['👉 barbell = strength', '👉 dumbbells = control & range', '👉 machine = safety', '👉 incline = upper chest', '👉 decline = lower chest', '👉 close grip = triceps'],
  },
}

const pushUpGuideContent: Record<'ru' | 'en', { title: string; sections: ExerciseGuideSection[]; quickTitle: string; quickLines: string[]; shortTitle: string[] }> = {
  ru: {
    title: 'Как выбрать отжимания под себя',
    sections: [
      {
        title: '🔹 Общая грудь (база)',
        choose: ['Отжимания от пола'],
        focus: 'Прямая линия тела + контроль',
      },
      {
        title: '🔹 Верх груди',
        choose: ['Отжимания с уклоном вниз (ноги на возвышении)'],
        focus: 'Чем выше ноги — тем больше нагрузка на верх груди',
      },
      {
        title: '🔹 Низ груди',
        choose: ['Отжимания на брусьях с акцентом на грудь'],
        focus: 'Наклон корпуса вперёд',
      },
      {
        title: '🔹 Новичок / упрощение',
        choose: ['Отжимания с возвышения', 'Отжимания с колен'],
        why: 'меньше нагрузка → проще техника',
        focus: 'Освоить форму',
      },
      {
        title: '🔹 Усложнение',
        choose: ['Отжимания с уклоном вниз', 'Отжимания на брусьях'],
        why: 'увеличивается нагрузка',
        focus: 'Контроль и стабильность',
      },
    ],
    quickTitle: '🔑 Быстрый ориентир',
    quickLines: ['новичок → с колен / с возвышения', 'база → отжимания от пола', 'верх груди → ноги выше', 'низ груди → брусья', 'сложнее → уклон вниз'],
    shortTitle: ['👉 проще → возвышение / колени', '👉 база → пол', '👉 сложнее → ноги вверх', '👉 низ груди → брусья'],
  },
  en: {
    title: 'How to Choose Push-Ups',
    sections: [
      {
        title: '🔹 Overall Chest (Base)',
        choose: ['Standard Push-Ups'],
        focus: 'Straight body line + control',
      },
      {
        title: '🔹 Upper Chest',
        choose: ['Decline Push-Ups (feet elevated)'],
        focus: 'Higher feet = more upper chest',
      },
      {
        title: '🔹 Lower Chest',
        choose: ['Dips (chest-focused)'],
        focus: 'Lean forward',
      },
      {
        title: '🔹 Beginner / Easier',
        choose: ['Incline Push-Ups', 'Knee Push-Ups'],
        why: 'less load, easier control',
        focus: 'master the form',
      },
      {
        title: '🔹 Harder Variations',
        choose: ['Decline Push-Ups', 'Dips'],
        focus: 'control + stability',
      },
    ],
    quickTitle: '🔑 Quick guide',
    quickLines: ['beginner → incline / knees', 'base → standard push-ups', 'upper chest → feet elevated', 'lower chest → dips', 'harder → decline'],
    shortTitle: ['👉 easier → incline / knees', '👉 base → floor', '👉 harder → feet up', '👉 lower chest → dips'],
  },
}

const chestFlyGuideContent: Record<'ru' | 'en', { title: string; sections: ExerciseGuideSection[]; quickTitle: string; quickLines: string[]; shortTitle: string[] }> = {
  ru: {
    title: 'Как выбрать сведения под себя',
    sections: [
      {
        title: '🔹 Общая грудь (центр)',
        choose: ['Сведение рук в кроссовере (горизонтально)', 'Сведение рук в тренажёре пек-дек'],
        why: 'кроссовер → больше свободы движения; пек-дек → больше стабильности',
        focus: 'Сведение рук и сокращение грудных',
      },
      {
        title: '🔹 Верх груди',
        choose: ['Сведение рук в кроссовере под наклоном (снизу вверх)'],
        focus: 'Движение вверх + акцент на верх груди',
      },
      {
        title: '🔹 Низ груди',
        choose: ['Сведение рук в кроссовере с отрицательным наклоном (сверху вниз)'],
        focus: 'Движение вниз + акцент на нижнюю часть груди',
      },
      {
        title: '🔹 Новичок / контроль',
        choose: ['Сведение рук в тренажёре пек-дек'],
        why: 'фиксированная траектория → легче техника',
        focus: 'Контроль и ощущение мышц',
      },
      {
        title: '🔹 Максимальное сокращение',
        choose: ['Сведение рук в кроссовере (любой угол)'],
        why: 'можно «дожать» грудные в конце',
        focus: 'Пауза в сведении',
      },
    ],
    quickTitle: '🔑 Быстрый ориентир',
    quickLines: ['центр → горизонтально', 'верх → снизу вверх', 'низ → сверху вниз', 'новичок → пек-дек', 'изоляция → кроссовер'],
    shortTitle: ['👉 вверх = верх груди', '👉 вниз = низ груди', '👉 прямо = центр', '👉 кроссовер = свобода', '👉 пек-дек = контроль'],
  },
  en: {
    title: 'How to Choose Chest Fly Variations',
    sections: [
      {
        title: '🔹 Mid Chest',
        choose: ['Cable Fly (horizontal)', 'Pec Deck Machine'],
        why: 'cable → more freedom; machine → more stability',
        focus: 'Squeeze the chest',
      },
      {
        title: '🔹 Upper Chest',
        choose: ['Low-to-High Cable Fly'],
        focus: 'Upward motion',
      },
      {
        title: '🔹 Lower Chest',
        choose: ['High-to-Low Cable Fly'],
        focus: 'Downward motion',
      },
      {
        title: '🔹 Beginner / Control',
        choose: ['Pec Deck Machine'],
        focus: 'Control and feel',
      },
      {
        title: '🔹 Maximum Contraction',
        choose: ['Cable Fly (any angle)'],
        focus: 'Squeeze and hold',
      },
    ],
    quickTitle: '🔑 Quick guide',
    quickLines: ['mid → horizontal', 'upper → low to high', 'lower → high to low', 'beginner → machine', 'isolation → cable'],
    shortTitle: ['👉 up = upper chest', '👉 down = lower chest', '👉 straight = mid chest', '👉 cable = freedom', '👉 machine = control'],
  },
}

const baseRowGuideContent: Record<'ru' | 'en', { title: string; sections: ExerciseGuideSection[]; quickTitle: string; quickLines: string[]; shortTitle: string[] }> = {
  ru: {
    title: 'Как выбрать тягу под себя (изоляция и детализация спины)',
    sections: [
      {
        title: '🔹 Широчайшие (изоляция)',
        choose: ['Тяга прямыми руками на верхнем блоке (канат)'],
        why: 'изолирует широчайшие без участия рук',
        focus: 'Движение через плечо, не сгибать руки',
      },
      {
        title: '🔹 Верх спины / задняя дельта',
        choose: ['Тяга к лицу', 'Высокая тяга в кроссовере'],
        why: 'тяга к лицу → больше задняя дельта; высокая тяга → больше средняя часть спины',
        focus: 'Локти в стороны + сведение лопаток',
      },
      {
        title: '🔹 Контроль и техника',
        choose: ['Тяга лёжа на высокой скамье', 'Тяга гантелей с упором грудью'],
        why: 'убирается читинг и нагрузка на поясницу',
        focus: 'Чистая работа спины',
      },
      {
        title: '🔹 Баланс и изоляция',
        choose: ['Тяга гантелей с упором грудью'],
        why: 'лучше чувствуются мышцы',
        focus: 'Медленное выполнение',
      },
    ],
    quickTitle: '🔑 Быстрый ориентир',
    quickLines: ['широчайшие → прямые руки', 'задняя дельта → тяга к лицу', 'верх спины → высокая тяга', 'контроль → упор грудью / скамья'],
    shortTitle: ['👉 прямые руки = изоляция широчайших', '👉 к лицу = задняя дельта', '👉 высокая тяга = верх спины', '👉 упор = контроль 💪'],
  },
  en: {
    title: 'How to Choose a Back Isolation Exercise',
    sections: [
      {
        title: '🔹 Lats Isolation',
        choose: ['Straight-Arm Cable Pulldown (rope)'],
        focus: 'No elbow bend',
      },
      {
        title: '🔹 Upper Back / Rear Delts',
        choose: ['Face Pull', 'High Cable Row'],
        why: 'face pull → rear delts; high row → mid/upper back',
        focus: 'Elbows out + squeeze',
      },
      {
        title: '🔹 Control / Technique',
        choose: ['Chest-Supported Row', 'Incline Bench Row'],
        focus: 'No cheating',
      },
      {
        title: '🔹 Mind-Muscle Connection',
        choose: ['Chest-Supported Dumbbell Row'],
        focus: 'Slow reps',
      },
    ],
    quickTitle: '🔑 Quick guide',
    quickLines: ['lats → straight-arm', 'rear delts → face pull', 'upper back → high row', 'control → chest-supported'],
    shortTitle: ['👉 straight arms = lats', '👉 face pull = rear delts', '👉 high row = upper back', '👉 support = control 💪'],
  },
}

const pullUpGuideContent: Record<'ru' | 'en', { title: string; sections: ExerciseGuideSection[]; quickTitle: string; quickLines: string[]; shortTitle: string[] }> = {
  ru: {
    title: 'Как выбрать подтягивания под себя',
    sections: [
      {
        title: '🔹 Новичок / самый простой уровень',
        choose: ['Австралийские подтягивания', 'Подтягивания в гравитроне'],
        why: 'меньше нагрузка, проще контролировать технику',
        focus: 'Полная амплитуда + контроль',
      },
      {
        title: '🔹 База (универсальный вариант)',
        choose: ['Подтягивания прямым хватом'],
        focus: 'Грудь к перекладине + контроль',
      },
      {
        title: '🔹 Комфорт + баланс',
        choose: ['Подтягивания параллельным хватом'],
        why: 'самый дружелюбный для суставов вариант',
        focus: 'Контроль и стабильность',
      },
      {
        title: '🔹 Бицепс + спина',
        choose: ['Подтягивания обратным хватом'],
        focus: 'Больше работа рук',
      },
      {
        title: '🔹 Плотность / низ широчайших',
        choose: ['Подтягивания узким хватом'],
        focus: 'Локти вниз к корпусу',
      },
      {
        title: '🔹 Прогрессия / усложнение',
        choose: ['Подтягивания с собственным весом (разные хваты)'],
        focus: 'Чистая техника без раскачки',
      },
    ],
    quickTitle: '🔑 Быстрый ориентир',
    quickLines: [
      'новичок → австралийские / гравитрон',
      'база → прямой хват',
      'комфорт → параллельный хват',
      'бицепс → обратный хват',
      'плотность → узкий хват',
    ],
    shortTitle: [
      '👉 проще → австралийские / гравитрон',
      '👉 база → прямой хват',
      '👉 мягче для суставов → параллельный',
      '👉 руки → обратный',
      '👉 акцент → узкий',
    ],
  },
  en: {
    title: 'How to Choose Pull-Ups',
    sections: [
      {
        title: '🔹 Beginner / Easiest',
        choose: ['Australian Pull-Ups (Inverted Rows)', 'Assisted Pull-Ups (machine)'],
        why: 'less load, easier to control',
        focus: 'full range + control',
      },
      {
        title: '🔹 Base (Standard)',
        choose: ['Pull-Ups (overhand grip)'],
        focus: 'chest to bar',
      },
      {
        title: '🔹 Comfort / Joint-Friendly',
        choose: ['Neutral-Grip Pull-Ups'],
        focus: 'control and stability',
      },
      {
        title: '🔹 Back + Biceps',
        choose: ['Chin-Ups (underhand grip)'],
        focus: 'more arm involvement',
      },
      {
        title: '🔹 Lower Lats / Density',
        choose: ['Close-Grip Pull-Ups'],
        focus: 'elbows down',
      },
      {
        title: '🔹 Progression',
        choose: ['Pull-Ups with bodyweight (different grips)'],
        focus: 'strict technique, no swinging',
      },
    ],
    quickTitle: '🔑 Quick guide',
    quickLines: ['beginner → assisted / inverted', 'base → overhand', 'comfort → neutral grip', 'biceps → underhand', 'density → close grip'],
    shortTitle: ['👉 easier → assisted / inverted', '👉 base → overhand', '👉 comfortable → neutral', '👉 arms → underhand', '👉 focus → close grip'],
  },
}

const legPressGuideContent: Record<'ru' | 'en', { title: string; sections: ExerciseGuideSection[]; quickTitle: string; quickLines: string[]; shortTitle: string[] }> = {
  ru: {
    title: 'Как выбрать жим ногами под себя',
    sections: [
      {
        title: '🔹 База (универсальный вариант)',
        choose: ['Горизонтальный жим ногами'],
        why: 'самый стабильный и понятный вариант',
        focus: 'Контроль движения + полная амплитуда',
      },
      {
        title: '🔹 Максимальная нагрузка / сила',
        choose: ['Жим ногами (классический под углом ~45°)'],
        why: 'позволяет работать с большими весами',
        focus: 'Давление через пятки',
      },
      {
        title: '🔹 Акцент на ягодицы',
        choose: ['Вертикальный жим ногами'],
        why: 'больше работа через тазобедренный сустав',
        focus: 'Контроль + не отрывать таз',
      },
      {
        title: '🔹 Новичок / безопасность',
        choose: ['Горизонтальный жим ногами'],
        why: 'легче контролировать технику',
        focus: 'Поясница прижата',
      },
      {
        title: '🔹 Контроль и техника',
        choose: ['Вертикальный жим ногами'],
        why: 'заставляет держать правильную механику',
        focus: 'Не терять положение корпуса',
      },
    ],
    quickTitle: '🔑 Быстрый ориентир',
    quickLines: ['новичок → горизонтальный', 'база → горизонтальный / классический', 'сила → классический (45°)', 'ягодицы → вертикальный', 'контроль → вертикальный'],
    shortTitle: ['👉 горизонтальный = проще и безопаснее', '👉 классический = сила и вес', '👉 вертикальный = контроль и ягодицы 💪'],
  },
  en: {
    title: 'How to Choose a Leg Press',
    sections: [
      {
        title: '🔹 Base (Universal)',
        choose: ['Horizontal Leg Press'],
        focus: 'control + full range',
      },
      {
        title: '🔹 Strength / Heavy Load',
        choose: ['45-Degree Leg Press'],
        focus: 'drive through heels',
      },
      {
        title: '🔹 Glutes Focus',
        choose: ['Vertical Leg Press'],
        focus: 'hip control',
      },
      {
        title: '🔹 Beginner / Safety',
        choose: ['Horizontal Leg Press'],
        focus: 'lower back pressed',
      },
    ],
    quickTitle: '🔑 Quick guide',
    quickLines: ['beginner → horizontal', 'base → horizontal / 45°', 'strength → 45°', 'glutes → vertical'],
    shortTitle: ['👉 horizontal = easiest', '👉 45° = strength', '👉 vertical = control & glutes 💪'],
  },
}

interface StoredBuilderWorkout {
  selectedExercises: BuilderExercise[]
  executionMode: 'reps' | 'timer'
  sourcePath: string
  createdAt: string
}

export default function ExerciseBuilderScreen({
  title,
  subtitle,
  backTo,
  groups,
  trainingPath,
  storageKey,
  modePreset,
  useGuidedFullBodyFlow = false,
  useGuidedSplitFlow = false,
}: ExerciseBuilderScreenProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const tagLabels: Record<BuilderExerciseTag, string> = {
    'Main exercise': t('workoutBuilder.tagMain'),
    Accessory: t('workoutBuilder.tagAccessory'),
    Isolation: t('workoutBuilder.tagIsolation'),
    Cardio: t('workoutBuilder.tagCardio'),
    'Core exercise': t('workoutBuilder.tagCore'),
  }

  const levelLabel: Record<ExerciseLevel, string> = {
    Beginner: t('workoutBuilder.levelBeginner'),
    Intermediate: t('workoutBuilder.levelIntermediate'),
    Advanced: t('workoutBuilder.levelAdvanced'),
  }

  const [executionMode, setExecutionMode] = useState<'reps' | 'timer'>('reps')
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set())
  const [activeExercise, setActiveExercise] = useState<BuilderExercise | null>(null)
  const [deadliftGuideExerciseName, setDeadliftGuideExerciseName] = useState<string | null>(null)
  const [pressGuideExerciseName, setPressGuideExerciseName] = useState<string | null>(null)
  const [pushUpGuideExerciseName, setPushUpGuideExerciseName] = useState<string | null>(null)
  const [chestFlyGuideExerciseName, setChestFlyGuideExerciseName] = useState<string | null>(null)
  const [baseRowGuideExerciseName, setBaseRowGuideExerciseName] = useState<string | null>(null)
  const [pullUpGuideExerciseName, setPullUpGuideExerciseName] = useState<string | null>(null)
  const [legPressGuideExerciseName, setLegPressGuideExerciseName] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const effectiveExecutionMode: 'reps' | 'timer' = modePreset === 'tone' ? 'reps' : executionMode

  const closeAllGuides = useCallback(() => {
    setDeadliftGuideExerciseName(null)
    setPressGuideExerciseName(null)
    setPushUpGuideExerciseName(null)
    setChestFlyGuideExerciseName(null)
    setBaseRowGuideExerciseName(null)
    setPullUpGuideExerciseName(null)
    setLegPressGuideExerciseName(null)
  }, [])

  const openGuide = useCallback(
    (guide: 'deadlift' | 'press' | 'push-up' | 'chest-fly' | 'base-row' | 'pull-up' | 'leg-press', exerciseName: string) => {
      closeAllGuides()

      if (guide === 'deadlift') {
        setDeadliftGuideExerciseName(exerciseName)
        return
      }
      if (guide === 'press') {
        setPressGuideExerciseName(exerciseName)
        return
      }
      if (guide === 'push-up') {
        setPushUpGuideExerciseName(exerciseName)
        return
      }
      if (guide === 'chest-fly') {
        setChestFlyGuideExerciseName(exerciseName)
        return
      }
      if (guide === 'base-row') {
        setBaseRowGuideExerciseName(exerciseName)
        return
      }

      if (guide === 'leg-press') {
        setLegPressGuideExerciseName(exerciseName)
        return
      }

      setPullUpGuideExerciseName(exerciseName)
    },
    [closeAllGuides]
  )

  useEffect(() => {
    if (!activeExercise && !deadliftGuideExerciseName && !pressGuideExerciseName && !pushUpGuideExerciseName && !chestFlyGuideExerciseName && !baseRowGuideExerciseName && !pullUpGuideExerciseName && !legPressGuideExerciseName) {
      return
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveExercise(null)
        closeAllGuides()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onEscape)
    }
  }, [activeExercise, baseRowGuideExerciseName, chestFlyGuideExerciseName, closeAllGuides, deadliftGuideExerciseName, legPressGuideExerciseName, pressGuideExerciseName, pullUpGuideExerciseName, pushUpGuideExerciseName])

  const formatTechniqueBlocks = (technique?: string) => {
    const fallback = t('workoutBuilder.primaryTargetMuscles')
    if (!technique) {
      return {
        steps: [{ title: t('workoutBuilder.execution'), description: fallback }],
        keyPoints: [] as string[],
      }
    }

    const keyPointsSplit = technique.split(/\n\n(?:Key points|Ключевые моменты):?\n?/i)
    const rawSteps = keyPointsSplit[0] ?? ''
    const rawKeyPoints = keyPointsSplit[1] ?? ''

    const firstStepIndex = rawSteps.search(/\b1\.\s/)
    const normalizedStepsText = firstStepIndex >= 0 ? rawSteps.slice(firstStepIndex).trim() : rawSteps.trim()

    const steps = normalizedStepsText
      .split(/\n(?=\d+\.\s)/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const match = item.match(/^(\d+)\.\s([^\n]+)\n([\s\S]+)$/)
        if (!match) {
          return {
            title: t('workoutBuilder.execution'),
            description: item,
          }
        }

        return {
          title: `${match[1]}. ${match[2]}`,
          description: match[3].trim(),
        }
      })

    const keyPoints = (rawKeyPoints ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^[-•]\s*/, ''))

    return {
      steps: steps.length > 0 ? steps : [{ title: t('workoutBuilder.execution'), description: rawSteps.trim() || fallback }],
      keyPoints,
    }
  }

  const activeTechniqueBlocks = formatTechniqueBlocks(
    localizeTechniqueText(activeExercise?.technique, activeExercise?.tag, activeExercise?.name, language)
  )

  const groupsWithStableIds = useMemo(() => {
    return groups.map((group) => ({
      ...group,
      exercises: group.exercises.map((exercise, index) => {
        const id = exercise.id ?? buildExerciseId(group.title, exercise.name, index)
        return {
          ...exercise,
          id,
          zone: exercise.zone ?? group.title.replace(/^Group \d+\s*-\s*/i, ''),
          sets: exercise.sets ?? '3-4',
          reps: exercise.reps ?? (modePreset === 'fat-loss' ? '15-18' : '8-12'),
        }
      }),
    }))
  }, [groups, modePreset])

  const flattened = useMemo(() => {
    return groupsWithStableIds.flatMap((group) => group.exercises)
  }, [groupsWithStableIds])

  const byId = useMemo(() => {
    return new Map(flattened.map((exercise) => [exercise.id, exercise]))
  }, [flattened])

  const guidedFullBodyPhases = useMemo(() => {
    const mainExercises = flattened.filter((exercise) => exercise.tag === 'Main exercise')
    const isolationExercises = flattened.filter((exercise) => exercise.tag === 'Isolation')
    const accessoryExercises = flattened.filter((exercise) => exercise.tag === 'Accessory')
    const coreExercises = flattened.filter(
      (exercise) => exercise.tag === 'Core exercise' || (exercise.zone ?? '').toLowerCase() === 'core / abs'
    )

    const phases: GuidedPhase[] = [
      {
        key: 'main',
        title: t('workoutBuilder.guidedChooseMainTitle'),
        hint: t('workoutBuilder.guidedChooseMainHint'),
        exercises: mainExercises,
      },
      {
        key: 'isolation',
        title: t('workoutBuilder.guidedChooseIsolationTitle'),
        hint: t('workoutBuilder.guidedChooseIsolationHint'),
        exercises: isolationExercises,
      },
      {
        key: 'accessory',
        title: t('workoutBuilder.guidedChooseAccessoryTitle'),
        hint: t('workoutBuilder.guidedChooseAccessoryHint'),
        exercises: accessoryExercises,
      },
      {
        key: 'core',
        title: t('workoutBuilder.guidedChooseCoreTitle'),
        hint: t('workoutBuilder.guidedChooseCoreHint'),
        exercises: coreExercises,
      },
    ]

    return phases.filter((phase) => phase.exercises.length > 0)
  }, [flattened, t])

  const guidedSplitPhases = useMemo(() => {
    const mainExercises = flattened.filter((exercise) => exercise.tag === 'Main exercise')
    const isolationExercises = flattened.filter((exercise) => exercise.tag === 'Isolation')
    const accessoryExercises = flattened.filter((exercise) => exercise.tag === 'Accessory')
    const coreExercises = flattened.filter(
      (exercise) => exercise.tag === 'Core exercise' || (exercise.zone ?? '').toLowerCase() === 'core / abs'
    )

    const phases: GuidedPhase[] = [
      {
        key: 'main',
        title: t('workoutBuilder.guidedSplitMainTitle'),
        hint: t('workoutBuilder.guidedSplitMainHint'),
        exercises: mainExercises,
      },
      {
        key: 'isolation',
        title: t('workoutBuilder.guidedSplitIsolationTitle'),
        hint: t('workoutBuilder.guidedSplitIsolationHint'),
        exercises: isolationExercises,
      },
      {
        key: 'accessory',
        title: t('workoutBuilder.guidedSplitAccessoryTitle'),
        hint: t('workoutBuilder.guidedSplitAccessoryHint'),
        exercises: accessoryExercises,
      },
      {
        key: 'core',
        title: t('workoutBuilder.guidedSplitCoreTitle'),
        hint: t('workoutBuilder.guidedSplitCoreHint'),
        exercises: coreExercises,
      },
    ]

    return phases.filter((phase) => phase.exercises.length > 0)
  }, [flattened, t])

  const isGuidedFlowRequested = useGuidedFullBodyFlow || useGuidedSplitFlow
  const guidedPhases = useGuidedSplitFlow ? guidedSplitPhases : guidedFullBodyPhases
  const isGuidedFlow = isGuidedFlowRequested && guidedPhases.length > 0
  const hasMissingSplitCategories = useGuidedSplitFlow && guidedSplitPhases.length < 4

  const [guidedStepIndex, setGuidedStepIndex] = useState(0)
  const guidedActivePhase = guidedPhases[guidedStepIndex] ?? null

  const normalizedSearch = exerciseSearch.trim().toLowerCase()

  const exerciseMatchesSearch = useCallback(
    (exercise: BuilderExercise, fallbackZone?: string) => {
      if (!normalizedSearch) {
        return true
      }

      const zone = (exercise.zone ?? fallbackZone ?? '').toLowerCase()
      const name = exercise.name.toLowerCase()
      const localizedZone = localizeExerciseZone(exercise.zone ?? fallbackZone ?? '', language).toLowerCase()
      const localizedName = localizeExerciseName(exercise.name, language).toLowerCase()
      const tag = exercise.tag.toLowerCase()
      return (
        name.includes(normalizedSearch) ||
        zone.includes(normalizedSearch) ||
        localizedName.includes(normalizedSearch) ||
        localizedZone.includes(normalizedSearch) ||
        tag.includes(normalizedSearch)
      )
    },
    [language, normalizedSearch]
  )

  const guidedVisibleExercises = useMemo(() => {
    if (!guidedActivePhase) {
      return [] as Array<BuilderExercise & { id: string }>
    }

    return guidedActivePhase.exercises.filter((exercise) => exerciseMatchesSearch(exercise, exercise.zone))
  }, [exerciseMatchesSearch, guidedActivePhase])

  const visibleGroups = useMemo(() => {
    return groupsWithStableIds
      .map((group) => {
        const exercises = group.exercises.filter((exercise) => exerciseMatchesSearch(exercise, exercise.zone ?? group.title))
        return {
          ...group,
          exercises,
        }
      })
      .filter((group) => group.exercises.length > 0)
  }, [exerciseMatchesSearch, groupsWithStableIds])

  const guidedPhaseSelectionCount = useMemo(() => {
    if (!guidedActivePhase) {
      return 0
    }

    const phaseIdSet = new Set(guidedActivePhase.exercises.map((exercise) => exercise.id))
    return Array.from(selectedExerciseIds).filter((id) => phaseIdSet.has(id)).length
  }, [guidedActivePhase, selectedExerciseIds])

  const guidedCanProceed = Boolean(guidedActivePhase)
  const guidedAtLastStep = guidedStepIndex >= guidedPhases.length - 1

  const selectedCount = selectedExerciseIds.size
  const canStart = selectedCount >= 1
  const canStartGuided = selectedCount >= 1
  const hasLevelMarkers = flattened.some((exercise) => (exercise.levels?.length ?? 0) > 0)

  const toggleExercise = useCallback((id: string) => {
    setSelectedExerciseIds((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const addExerciseToConstructor = useCallback((id: string) => {
    setSelectedExerciseIds((prev) => {
      if (prev.has(id)) {
        return prev
      }

      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const removeExerciseFromConstructor = useCallback((id: string) => {
    setSelectedExerciseIds((prev) => {
      if (!prev.has(id)) {
        return prev
      }

      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const guideChoiceExerciseIdMap = useMemo(() => {
    const map = new Map<string, string>()

    for (const exercise of flattened) {
      if (!exercise.id) {
        continue
      }
      map.set(normalizeGuideExerciseName(exercise.name), exercise.id)
      map.set(normalizeGuideExerciseName(localizeExerciseName(exercise.name, 'ru')), exercise.id)
      map.set(normalizeGuideExerciseName(localizeExerciseName(exercise.name, 'en')), exercise.id)
    }

    return map
  }, [flattened])

  const resolveGuideChoiceExerciseId = useCallback((choice: string) => {
    const normalizedChoice = normalizeGuideExerciseName(choice)
    if (!normalizedChoice) {
      return null
    }

    const direct = guideChoiceExerciseIdMap.get(normalizedChoice)
    if (direct) {
      return direct
    }

    const canonical = guideChoiceAliasToCanonical[normalizedChoice]
    if (!canonical) {
      let bestMatch: { id: string; score: number } | null = null

      for (const [name, id] of guideChoiceExerciseIdMap.entries()) {
        if (!name || !normalizedChoice) {
          continue
        }
        if (!name.includes(normalizedChoice) && !normalizedChoice.includes(name)) {
          continue
        }

        const score = Math.min(name.length, normalizedChoice.length)
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { id, score }
        }
      }

      return bestMatch?.id ?? null
    }

    return guideChoiceExerciseIdMap.get(normalizeGuideExerciseName(canonical)) ?? null
  }, [guideChoiceExerciseIdMap])

  const resolvedGuideChoiceCache = useMemo(() => {
    const cache = new Map<string, string | null>()

    const collectContentChoices = (content: Record<'ru' | 'en', { sections: ExerciseGuideSection[] }>) => {
      for (const langKey of ['ru', 'en'] as const) {
        for (const section of content[langKey].sections) {
          for (const choice of section.choose) {
            if (!cache.has(choice)) {
              cache.set(choice, resolveGuideChoiceExerciseId(choice))
            }
          }
        }
      }
    }

    collectContentChoices(deadliftGuideContent)
    collectContentChoices(pressGuideContent)
    collectContentChoices(pushUpGuideContent)
    collectContentChoices(chestFlyGuideContent)
    collectContentChoices(baseRowGuideContent)
    collectContentChoices(pullUpGuideContent)
    collectContentChoices(legPressGuideContent)

    return cache
  }, [resolveGuideChoiceExerciseId])

  const renderGuideChooseItem = useCallback((sectionTitle: string, item: string) => {
    const exerciseId = resolvedGuideChoiceCache.get(item) ?? resolveGuideChoiceExerciseId(item)
    const isSelectable = Boolean(exerciseId)
    const isSelected = exerciseId ? selectedExerciseIds.has(exerciseId) : false
    const addLabel = language === 'ru' ? 'Добавить в конструктор' : 'Add to builder'
    const removeLabel = language === 'ru' ? 'Удалить' : 'Remove'
    const addedLabel = language === 'ru' ? 'В конструкторе' : 'In builder'
    const addedHint = language === 'ru' ? 'Уже в конструкторе' : 'Already in constructor'
    const unavailableLabel = language === 'ru' ? 'Нет в этом конструкторе' : 'Unavailable in this builder'

    return (
      <li key={`${sectionTitle}-${item}`}>
        {isSelectable && exerciseId ? (
          <div className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${isSelected ? 'border-[#b9d9c5] bg-[#edf8f1] text-[#1f5e38]' : 'border-[#d8d9df] bg-white text-[#40404d]'}`}>
            <span className="flex flex-col">
              <span className={isSelected ? 'font-semibold' : ''}>{item}</span>
              {isSelected && <span className="mt-0.5 text-[11px] text-[#2b6f45]">{addedHint}</span>}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {isSelected ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#b9d9c5] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1f5e38]">
                    <Check size={12} />
                    {addedLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExerciseFromConstructor(exerciseId)}
                    className="inline-flex rounded-full border border-[#d05f5f] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#a52525] transition hover:bg-[#fff5f5]"
                  >
                    {removeLabel}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => addExerciseToConstructor(exerciseId)}
                  className="inline-flex rounded-full border border-[#111111] bg-[#111111] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#262626]"
                >
                  {addLabel}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#d8d9df] bg-[#f7f7f8] px-3 py-2 text-left text-sm text-[#5b5b63]">
            <span>{item}</span>
            <span className="inline-flex shrink-0 rounded-full border border-[#c7c8cf] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#666772]">
              {unavailableLabel}
            </span>
          </div>
        )}
      </li>
    )
  }, [addExerciseToConstructor, language, removeExerciseFromConstructor, resolveGuideChoiceExerciseId, resolvedGuideChoiceCache, selectedExerciseIds])

  const canProceed = isGuidedFlow ? canStartGuided : canStart

  const buildSelectedWorkoutPayload = () => {
    const selectedExercises = Array.from(selectedExerciseIds)
      .map((id) => byId.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    const payload: StoredBuilderWorkout = {
      executionMode: effectiveExecutionMode,
      sourcePath: backTo,
      selectedExercises,
      createdAt: new Date().toISOString(),
    }

    return payload
  }

  const handleStartOneTime = () => {
    if (isGuidedFlow ? !canStartGuided : !canStart) {
      return
    }

    const payload = buildSelectedWorkoutPayload()
    writeBuilderWorkoutStorage(storageKey, JSON.stringify(payload), user?.id)
    navigate(`${trainingPath}?key=${encodeURIComponent(storageKey)}`)
  }

  const openSaveModal = () => {
    if (!canProceed) {
      return
    }

    setSaveStatus('idle')
    setSaveError(null)
    setWorkoutName('')
    setShowSaveModal(true)
  }

  const persistSavedWorkout = async () => {
    if (!canProceed) {
      return null
    }

    if (!user?.id) {
      throw new Error(language === 'ru' ? 'Не удалось определить пользователя для синхронизации.' : 'Unable to identify user for synchronization.')
    }

    const trimmedName = workoutName.trim()
    const nowIso = new Date().toISOString()
    const runtimeId = createUuid()

    const savedKey = `saved-${modePreset}-${runtimeId}`
    const payload = buildSelectedWorkoutPayload()

    await saveCustomWorkoutSynced(user.id, {
      id: runtimeId,
      name: trimmedName || `${title} ${new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' })}`,
      modePreset,
      executionMode: payload.executionMode,
      selectedExercises: payload.selectedExercises,
      sourcePath: backTo,
      trainingPath,
      storageKey: savedKey,
      createdAt: nowIso,
    })

    return { savedKey, payload }
  }

  const handleSaveWorkout = async () => {
    try {
      const saved = await persistSavedWorkout()
      if (!saved) {
        return
      }

      setSaveError(null)
      setSaveStatus('saved')
    } catch (error) {
      setSaveStatus('error')
      setSaveError(getErrorMessage(error, language === 'ru' ? 'Не удалось сохранить тренировку. Проверьте интернет и попробуйте снова.' : 'Failed to save workout. Check your connection and try again.'))
    }
  }

  const handleSaveAndStartWorkout = async () => {
    try {
      const saved = await persistSavedWorkout()
      if (!saved) {
        return
      }

      setSaveError(null)
      writeBuilderWorkoutStorage(saved.savedKey, JSON.stringify(saved.payload), user?.id)
      navigate(`${trainingPath}?key=${encodeURIComponent(saved.savedKey)}`)
    } catch (error) {
      setSaveStatus('error')
      setSaveError(getErrorMessage(error, language === 'ru' ? 'Не удалось сохранить тренировку. Проверьте интернет и попробуйте снова.' : 'Failed to save workout. Check your connection and try again.'))
    }
  }

  const handleGuidedNext = () => {
    if (!guidedCanProceed || guidedAtLastStep) {
      return
    }

    setGuidedStepIndex((prev) => prev + 1)
  }

  const handleGuidedBack = () => {
    if (guidedStepIndex === 0) {
      return
    }

    setGuidedStepIndex((prev) => prev - 1)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-52">
      <main className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to={backTo} className="inline-flex items-center gap-2 text-base font-medium text-[#111111] transition hover:text-[#111111]">
            <ArrowLeft size={18} />
            {t('workoutBuilder.back')}
          </Link>

          <Link to="/dashboard" className="hidden items-center gap-2 rounded-2xl bg-[#efefef] px-4 py-2 text-sm text-[#111111] shadow-sm">
            <House size={16} />
            {t('workoutBuilder.menu')}
          </Link>
        </div>

        <div className="mb-8">
          <span className="inline-block rounded-full border border-[#d4d4d8] bg-[#f2afbc] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f0f10]">
            {t('workoutBuilder.trainingConstructor')}
          </span>

          <div className="mb-4 mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ececec] text-[#111111]">
            <SlidersHorizontal size={30} />
          </div>

          <h1 className="font-serif text-4xl leading-tight text-[#0f0f10] md:text-6xl">{title}</h1>
          <p className="mt-3 text-xl text-[#111111] md:text-2xl">{subtitle}</p>
        </div>

        <section className="mb-8 overflow-hidden rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] shadow-sm">
          <div className="border-b border-[#d4d4d8] px-6 py-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{t('workoutBuilder.executionScheme')}</p>
          </div>
          <div className="px-6 py-6">
            <h2 className="mb-5 text-xl font-semibold text-[#0f0f10] md:text-2xl">{t('workoutBuilder.chooseHowToPerform')}</h2>

            <div className={`grid gap-4 ${modePreset === 'fat-loss' ? 'md:grid-cols-2' : ''}`}>
              <button
                type="button"
                onClick={() => setExecutionMode('reps')}
                className={`rounded-2xl border p-5 text-left ${effectiveExecutionMode === 'reps' ? 'border-[#111111] bg-[#ececec]' : 'border-[#d4d4d8] bg-[#f7f7f7]'}`}
              >
                <p className="mb-2 text-3xl">🔢</p>
                <h3 className="text-xl font-semibold text-[#0f0f10] md:text-2xl">
                  {modePreset === 'fat-loss'
                    ? language === 'ru'
                      ? `🔢 ${t('workoutBuilder.option1FatLoss').replace(' - ', ' — ')}`
                      : t('workoutBuilder.option1FatLoss')
                    : t('workoutBuilder.option1Tone')}
                </h3>
                <ul className="mt-3 space-y-2 text-base text-[#111111] md:text-lg">
                  {modePreset === 'fat-loss' ? (
                    <>
                      <li>{t('workoutBuilder.complete3to5Rounds')}</li>
                      <li>{t('workoutBuilder.reps15to18')}</li>
                      <li>{t('workoutBuilder.restAfterRound1to2')}</li>
                    </>
                  ) : (
                    <>
                      <li>{t('workoutBuilder.complete3to4Sets')}</li>
                      <li>{t('workoutBuilder.reps8to12')}</li>
                      <li>{t('workoutBuilder.rest90to120BetweenExercises')}</li>
                    </>
                  )}
                </ul>
              </button>

              {modePreset === 'fat-loss' && (
                <button
                  type="button"
                  onClick={() => setExecutionMode('timer')}
                  className={`rounded-2xl border p-5 text-left ${effectiveExecutionMode === 'timer' ? 'border-[#111111] bg-[#fff1f4]' : 'border-[#d4d4d8] bg-[#f7f7f7]'}`}
                >
                  <p className="mb-2 text-3xl">⏱️</p>
                  <h3 className="text-xl font-semibold text-[#0f0f10] md:text-2xl">
                    {language === 'ru'
                      ? `⏱ ${t('workoutBuilder.option2FatLoss').replace(' - ', ' — ')}`
                      : t('workoutBuilder.option2FatLoss')}
                  </h3>
                  <ul className="mt-3 space-y-2 text-base text-[#111111] md:text-lg">
                    <>
                      <li>{t('workoutBuilder.complete3to5RoundsCircuit')}</li>
                      <li>{t('workoutBuilder.eachExercise30to50')}</li>
                      <li>{t('workoutBuilder.restAfterRound1to2')}</li>
                    </>
                  </ul>
                </button>
              )}
            </div>
          </div>
        </section>

        {hasLevelMarkers && (
          <section className="mb-8 overflow-hidden rounded-[22px] border border-[#d4d4d8] bg-white shadow-sm">
            <div className="border-b border-[#d4d4d8] px-6 py-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{t('workoutBuilder.complexityGuide')}</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#111111]">
                {(['Beginner', 'Intermediate', 'Advanced'] as ExerciseLevel[]).map((level) => (
                  <span key={level} className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-[#f8f8f8] px-3 py-1.5">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${levelDotClass[level]}`} aria-hidden="true" />
                    {levelLabel[level]}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#52525b]">
                {t('workoutBuilder.complexityNote')}
              </p>
            </div>
          </section>
        )}

        {isGuidedFlow ? (
          <section className="mb-8 overflow-hidden rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] shadow-sm">
            <div className="border-b border-[#d4d4d8] px-6 py-4">
              <p className="text-lg font-semibold text-[#111111]">{guidedActivePhase?.hint}</p>
              <p className="mt-2 text-sm font-semibold text-[#111111]">
                {t('workoutBuilder.selectedInStep')} {guidedPhaseSelectionCount}
              </p>
              {hasMissingSplitCategories && (
                <p className="mt-2 text-xs font-medium text-[#52525b]">
                  {t('workoutBuilder.missingSplitCategories')}
                </p>
              )}
            </div>

            <div className="border-b border-[#d4d4d8] px-4 py-3 md:px-5">
              <label className="sr-only" htmlFor="guided-exercise-search">{t('workoutBuilder.searchExercises')}</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={18} />
                <input
                  id="guided-exercise-search"
                  type="text"
                  value={exerciseSearch}
                  onChange={(event) => setExerciseSearch(event.target.value)}
                  placeholder={t('workoutBuilder.searchPlaceholder')}
                  className="w-full rounded-xl border border-[#d4d4d8] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111111]"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 md:p-5">
              {guidedVisibleExercises.map((exercise) => {
                const id = exercise.id
                if (!id) {
                  return null
                }
                const isSelected = selectedExerciseIds.has(id)
                const localizedName = localizeExerciseName(exercise.name, language)
                const localizedZone = localizeExerciseZone(exercise.zone ?? t('workoutBuilder.selectedGroup'), language)

                return (
                  <article
                    key={id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleExercise(id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleExercise(id)
                      }
                    }}
                    className={`flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] transition ${isSelected ? 'border-[#111111] bg-[#ececec]' : 'border-[#d4d4d8] bg-[#f5f5f5] hover:bg-white'}`}
                  >
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-[#111111] text-white' : 'bg-[#f2e0d2] text-transparent'}`}>
                      <Check size={22} />
                    </span>

                    <div className="flex-1">
                      <p className="text-xl font-semibold leading-tight text-[#0f0f10] md:text-2xl">
                        {exercise.icon ? `${exercise.icon} ` : ''}{localizedName}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#111111]">{t('workoutBuilder.category')} {localizedZone}</p>
                      {(exercise.levels?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {exercise.levels?.map((level) => (
                            <span key={`${exercise.name}-${level}`} className="inline-flex items-center gap-1.5 rounded-full border border-[#d4d4d8] bg-white px-2 py-0.5 text-xs font-semibold text-[#111111]">
                              <span className={`inline-flex h-2 w-2 rounded-full ${levelDotClass[level]}`} aria-hidden="true" />
                              {levelLabel[level]}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tagClasses[exercise.tag]}`}>
                        {tagLabels[exercise.tag]}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        setActiveExercise({
                          ...exercise,
                          zone: exercise.zone,
                          sets: exercise.sets ?? '3-4',
                          reps: exercise.reps ?? (modePreset === 'fat-loss' ? '15-18' : '8-12'),
                        })
                      }}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4d4d8] bg-white text-[#111111]"
                      aria-label={`${t('workoutBuilder.openTechniqueFor')} ${localizedName}`}
                    >
                      <Info size={22} />
                    </button>
                  </article>
                )
              })}

              {guidedVisibleExercises.length === 0 && (
                <p className="rounded-2xl border border-dashed border-[#d4d4d8] bg-white/70 px-4 py-4 text-sm text-[#52525b]">
                  {t('workoutBuilder.noExercisesFound')}
                </p>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] p-4 shadow-sm md:p-5">
              <label className="sr-only" htmlFor="builder-exercise-search">{t('workoutBuilder.searchExercises')}</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" size={18} />
                <input
                  id="builder-exercise-search"
                  type="text"
                  value={exerciseSearch}
                  onChange={(event) => setExerciseSearch(event.target.value)}
                  placeholder={t('workoutBuilder.searchPlaceholder')}
                  className="w-full rounded-xl border border-[#d4d4d8] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111111]"
                />
              </div>
            </section>

            {visibleGroups.map((group) => (
            <section key={group.title} className="mb-8 overflow-hidden rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] shadow-sm">
              <div className="border-b border-[#d4d4d8] px-6 py-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{localizeExerciseZone(group.title, language)}</h3>
              </div>

              <div className="space-y-4 p-4 md:p-5">
                {group.exercises.map((exercise) => {
                  const id = exercise.id
                  if (!id) {
                    return null
                  }
                  const isSelected = selectedExerciseIds.has(id)
                  const localizedName = localizeExerciseName(exercise.name, language)
                  const localizedZone = localizeExerciseZone(exercise.zone ?? group.title, language)

                  return (
                    <article
                      key={id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExercise(id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggleExercise(id)
                        }
                      }}
                      className={`flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] transition ${isSelected ? 'border-[#111111] bg-[#ececec]' : 'border-[#d4d4d8] bg-[#f5f5f5] hover:bg-white'}`}
                    >
                      <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSelected ? 'bg-[#111111] text-white' : 'bg-[#f2e0d2] text-transparent'}`}>
                        <Check size={22} />
                      </span>

                      <div className="flex-1">
                        <p className="text-xl font-semibold leading-tight text-[#0f0f10] md:text-2xl">
                          {exercise.icon ? `${exercise.icon} ` : ''}{localizedName}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#111111]">{t('workoutBuilder.category')} {localizedZone}</p>
                        {(exercise.levels?.length ?? 0) > 0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {exercise.levels?.map((level) => (
                              <span key={`${exercise.name}-${level}`} className="inline-flex items-center gap-1.5 rounded-full border border-[#d4d4d8] bg-white px-2 py-0.5 text-xs font-semibold text-[#111111]">
                                <span className={`inline-flex h-2 w-2 rounded-full ${levelDotClass[level]}`} aria-hidden="true" />
                                {levelLabel[level]}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tagClasses[exercise.tag]}`}>
                          {tagLabels[exercise.tag]}
                        </span>
                        {isDeadliftGuideExercise(exercise.name) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openGuide('deadlift', exercise.name)
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                          >
                            <BookOpen size={14} />
                            {language === 'ru' ? 'Как выбрать тягу под цель?' : 'How to Choose the Right Deadlift'}
                          </button>
                        )}
                        {isPressGuideExercise(exercise.name) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openGuide('press', exercise.name)
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                          >
                            <BookOpen size={14} />
                            {language === 'ru' ? 'Как выбрать жим под себя' : 'How to Choose the Right Press'}
                          </button>
                        )}
                        {isPushUpGuideExercise(exercise.name) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openGuide('push-up', exercise.name)
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                          >
                            <BookOpen size={14} />
                            {language === 'ru' ? 'Как выбрать отжимания под себя' : 'How to Choose Push-Ups'}
                          </button>
                        )}
                        {isChestFlyGuideExercise(exercise.name) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openGuide('chest-fly', exercise.name)
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                          >
                            <BookOpen size={14} />
                            {language === 'ru' ? 'Как выбрать сведения под себя' : 'How to Choose Chest Fly Variations'}
                          </button>
                        )}
                        {isBaseRowGuideExercise(exercise.name) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openGuide('base-row', exercise.name)
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                          >
                            <BookOpen size={14} />
                            {language === 'ru' ? 'Как выбрать тягу под себя (изоляция и детализация спины)' : 'How to Choose a Back Isolation Exercise'}
                          </button>
                        )}
                        {isPullUpGuideExercise(exercise.name) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openGuide('pull-up', exercise.name)
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                          >
                            <BookOpen size={14} />
                            {language === 'ru' ? 'Как выбрать подтягивания под себя' : 'How to Choose Pull-Ups'}
                          </button>
                        )}
                        {isLegPressGuideExercise(exercise.name) && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openGuide('leg-press', exercise.name)
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                          >
                            <BookOpen size={14} />
                            {language === 'ru' ? 'Как выбрать жим ногами под себя' : 'How to Choose a Leg Press'}
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setActiveExercise({
                            ...exercise,
                            zone: exercise.zone ?? group.title,
                            sets: exercise.sets ?? '3-4',
                            reps: exercise.reps ?? (modePreset === 'fat-loss' ? '15-18' : '8-12'),
                          })
                        }}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4d4d8] bg-white text-[#111111]"
                        aria-label={`${t('workoutBuilder.openTechniqueFor')} ${localizedName}`}
                      >
                        <Info size={22} />
                      </button>
                    </article>
                  )
                })}
              </div>
            </section>
            ))}

            {visibleGroups.length === 0 && (
              <section className="mb-8 rounded-[22px] border border-dashed border-[#d4d4d8] bg-white/70 px-4 py-5 text-sm text-[#52525b] md:px-6">
                {t('workoutBuilder.noExercisesFound')}
              </section>
            )}
          </>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d4d4d8] bg-[#f2f2f2]/95 px-4 py-5 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-center text-sm font-medium text-[#111111]">{t('workoutBuilder.selected')} {selectedCount}</p>

          {isGuidedFlow ? (
            <div className="flex gap-3">
              <button
                type="button"
                disabled={guidedStepIndex === 0}
                onClick={handleGuidedBack}
                className={`inline-flex w-1/3 items-center justify-center rounded-2xl px-4 py-4 text-base font-semibold ${guidedStepIndex === 0 ? 'bg-[#dccfca] text-[#8f7f79]' : 'bg-white text-[#111111] border border-[#d4d4d8]'}`}
              >
                {t('workoutBuilder.previous')}
              </button>

              {guidedAtLastStep ? (
                <div className="flex w-2/3 gap-3">
                  <button
                    type="button"
                    disabled={!guidedCanProceed || !canStartGuided}
                    onClick={openSaveModal}
                    className={`inline-flex w-1/2 items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-semibold md:text-lg ${guidedCanProceed && canStartGuided ? 'bg-white text-[#111111] border border-[#d4d4d8]' : 'bg-[#e6ddd9] text-[#8f7f79]'}`}
                  >
                    <Save size={18} />
                    {t('workoutBuilder.save')}
                  </button>

                  <button
                    type="button"
                    disabled={!guidedCanProceed || !canStartGuided}
                    onClick={handleStartOneTime}
                    className={`inline-flex w-1/2 items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-semibold md:text-lg ${guidedCanProceed && canStartGuided ? 'bg-[#111111] text-white' : 'bg-[#dccfca] text-[#8f7f79]'}`}
                  >
                    <PlayCircle size={18} />
                    {t('workoutBuilder.startOneTime')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!guidedCanProceed}
                  onClick={handleGuidedNext}
                  className={`inline-flex w-2/3 items-center justify-center rounded-2xl px-6 py-4 text-xl font-semibold md:text-2xl ${guidedCanProceed ? 'bg-[#111111] text-white' : 'bg-[#dccfca] text-[#8f7f79]'}`}
                >
                  {t('workoutBuilder.nextStep')}
                </button>
              )}
            </div>
          ) : (
            <>
              {!canStart && (
                <p className="mb-3 text-center text-base font-semibold text-[#111111] md:text-lg">{t('workoutBuilder.selectAtLeastOne')}</p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={openSaveModal}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-lg font-semibold ${canStart ? 'bg-white text-[#111111] border border-[#d4d4d8]' : 'bg-[#e6ddd9] text-[#8f7f79]'}`}
                >
                  <Save size={20} />
                  {t('workoutBuilder.saveWorkout')}
                </button>

                <button
                  type="button"
                  disabled={!canStart}
                  onClick={handleStartOneTime}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-lg font-semibold ${canStart ? 'bg-[#111111] text-white' : 'bg-[#dccfca] text-[#8f7f79]'}`}
                >
                  <PlayCircle size={20} />
                  {t('workoutBuilder.startOneTime')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-[#d4d4d8] bg-[#f1f1f1] p-6 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#111111]">{t('workoutBuilder.saveWorkoutModalTitle')}</h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4d4d8] bg-white text-[#111111]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-[#52525b]">{t('workoutBuilder.saveSelectionHint')}</p>

            <label className="mt-4 block text-sm font-semibold text-[#111111]" htmlFor="workout-name">
              {t('workoutBuilder.workoutName')}
            </label>
            <input
              id="workout-name"
              type="text"
              value={workoutName}
              onChange={(event) => {
                setWorkoutName(event.target.value)
                setSaveStatus('idle')
                setSaveError(null)
              }}
              placeholder={t('workoutBuilder.workoutNamePlaceholder')}
              className="mt-2 w-full rounded-xl border border-[#d4d4d8] bg-white px-3 py-2.5 text-sm text-[#111111]"
              maxLength={60}
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="rounded-xl border border-[#d4d4d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#111111]"
              >
                {t('workoutBuilder.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSaveWorkout()
                }}
                className="rounded-xl bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white"
              >
                {saveStatus === 'saved' ? t('workoutBuilder.saved') : t('workoutBuilder.saveWorkout')}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSaveAndStartWorkout()
                }}
                className="rounded-xl border border-[#111111] bg-white px-4 py-2.5 text-sm font-semibold text-[#111111]"
              >
                {t('workoutBuilder.saveAndStart')}
              </button>
            </div>

            {saveStatus === 'saved' && (
              <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700">
                {t('workoutBuilder.savedMessage')}
              </p>
            )}

            {saveStatus === 'error' && saveError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {saveError}
              </p>
            )}
          </div>
        </div>
      )}

      {deadliftGuideExerciseName && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setDeadliftGuideExerciseName(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">
                  {language === 'ru' ? 'Гайд по тягам' : 'Deadlift Guide'}
                </p>
                <button
                  type="button"
                  onClick={() => setDeadliftGuideExerciseName(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={language === 'ru' ? 'Закрыть гайд' : 'Close guide'}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {deadliftGuideContent[language === 'ru' ? 'ru' : 'en'].title}
              </h2>
              <p className="mt-2 text-sm text-[#3d3d45]">
                {language === 'ru' ? `Упражнение: ${localizeExerciseName(deadliftGuideExerciseName, language)}` : `Exercise: ${localizeExerciseName(deadliftGuideExerciseName, language)}`}
              </p>
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {deadliftGuideContent[language === 'ru' ? 'ru' : 'en'].sections.map((section) => (
                  <article key={section.title} className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4">
                    <h3 className="text-base font-semibold text-[#191923]">{section.title}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5e67]">
                      {language === 'ru' ? 'Выбор' : 'Choose'}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-[#40404d]">
                      {section.choose.map((item) => renderGuideChooseItem(section.title, item))}
                    </ul>
                    {section.why && (
                      <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">{language === 'ru' ? 'Почему:' : 'Why:'}</span> {section.why}</p>
                    )}
                    <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">👉 {language === 'ru' ? 'Фокус:' : 'Focus:'}</span> {section.focus}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">
                  {deadliftGuideContent[language === 'ru' ? 'ru' : 'en'].quickTitle}
                </p>
                <ul className="mt-2 space-y-2">
                  {deadliftGuideContent[language === 'ru' ? 'ru' : 'en'].quickLines.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {pressGuideExerciseName && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setPressGuideExerciseName(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">
                  {language === 'ru' ? 'Гайд по жимам' : 'Press Guide'}
                </p>
                <button
                  type="button"
                  onClick={() => setPressGuideExerciseName(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={language === 'ru' ? 'Закрыть гайд' : 'Close guide'}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {pressGuideContent[language === 'ru' ? 'ru' : 'en'].title}
              </h2>
              <p className="mt-2 text-sm text-[#3d3d45]">
                {language === 'ru' ? `Упражнение: ${localizeExerciseName(pressGuideExerciseName, language)}` : `Exercise: ${localizeExerciseName(pressGuideExerciseName, language)}`}
              </p>
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {pressGuideContent[language === 'ru' ? 'ru' : 'en'].sections.map((section) => (
                  <article key={section.title} className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4">
                    <h3 className="text-base font-semibold text-[#191923]">{section.title}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5e67]">
                      {language === 'ru' ? 'Выбор' : 'Choose'}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-[#40404d]">
                      {section.choose.map((item) => renderGuideChooseItem(section.title, item))}
                    </ul>
                    {section.why && (
                      <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">{language === 'ru' ? '👉 Разница:' : '👉 Difference:'}</span> {section.why}</p>
                    )}
                    <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">👉 {language === 'ru' ? 'Фокус:' : 'Focus:'}</span> {section.focus}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">
                  {pressGuideContent[language === 'ru' ? 'ru' : 'en'].quickTitle}
                </p>
                <ul className="mt-2 space-y-2">
                  {pressGuideContent[language === 'ru' ? 'ru' : 'en'].quickLines.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">💬 {language === 'ru' ? 'Коротко' : 'In short'}</p>
                <ul className="mt-2 space-y-2">
                  {pressGuideContent[language === 'ru' ? 'ru' : 'en'].shortTitle.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {pushUpGuideExerciseName && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setPushUpGuideExerciseName(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">
                  {language === 'ru' ? 'Гайд по отжиманиям' : 'Push-Up Guide'}
                </p>
                <button
                  type="button"
                  onClick={() => setPushUpGuideExerciseName(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={language === 'ru' ? 'Закрыть гайд' : 'Close guide'}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {pushUpGuideContent[language === 'ru' ? 'ru' : 'en'].title}
              </h2>
              <p className="mt-2 text-sm text-[#3d3d45]">
                {language === 'ru' ? `Упражнение: ${localizeExerciseName(pushUpGuideExerciseName, language)}` : `Exercise: ${localizeExerciseName(pushUpGuideExerciseName, language)}`}
              </p>
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {pushUpGuideContent[language === 'ru' ? 'ru' : 'en'].sections.map((section) => (
                  <article key={section.title} className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4">
                    <h3 className="text-base font-semibold text-[#191923]">{section.title}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5e67]">
                      {language === 'ru' ? 'Выбор' : 'Choose'}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-[#40404d]">
                      {section.choose.map((item) => renderGuideChooseItem(section.title, item))}
                    </ul>
                    {section.why && (
                      <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">{language === 'ru' ? '👉 Почему:' : '👉 Why:'}</span> {section.why}</p>
                    )}
                    <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">👉 {language === 'ru' ? 'Фокус:' : 'Focus:'}</span> {section.focus}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">
                  {pushUpGuideContent[language === 'ru' ? 'ru' : 'en'].quickTitle}
                </p>
                <ul className="mt-2 space-y-2">
                  {pushUpGuideContent[language === 'ru' ? 'ru' : 'en'].quickLines.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">💬 {language === 'ru' ? 'Коротко' : 'In short'}</p>
                <ul className="mt-2 space-y-2">
                  {pushUpGuideContent[language === 'ru' ? 'ru' : 'en'].shortTitle.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {chestFlyGuideExerciseName && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setChestFlyGuideExerciseName(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">
                  {language === 'ru' ? 'Гайд по сведениям' : 'Chest Fly Guide'}
                </p>
                <button
                  type="button"
                  onClick={() => setChestFlyGuideExerciseName(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={language === 'ru' ? 'Закрыть гайд' : 'Close guide'}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {chestFlyGuideContent[language === 'ru' ? 'ru' : 'en'].title}
              </h2>
              <p className="mt-2 text-sm text-[#3d3d45]">
                {language === 'ru' ? `Упражнение: ${localizeExerciseName(chestFlyGuideExerciseName, language)}` : `Exercise: ${localizeExerciseName(chestFlyGuideExerciseName, language)}`}
              </p>
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {chestFlyGuideContent[language === 'ru' ? 'ru' : 'en'].sections.map((section) => (
                  <article key={section.title} className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4">
                    <h3 className="text-base font-semibold text-[#191923]">{section.title}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5e67]">
                      {language === 'ru' ? 'Выбор' : 'Choose'}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-[#40404d]">
                      {section.choose.map((item) => renderGuideChooseItem(section.title, item))}
                    </ul>
                    {section.why && (
                      <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">{language === 'ru' ? '👉 Разница:' : '👉 Difference:'}</span> {section.why}</p>
                    )}
                    <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">👉 {language === 'ru' ? 'Фокус:' : 'Focus:'}</span> {section.focus}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">
                  {chestFlyGuideContent[language === 'ru' ? 'ru' : 'en'].quickTitle}
                </p>
                <ul className="mt-2 space-y-2">
                  {chestFlyGuideContent[language === 'ru' ? 'ru' : 'en'].quickLines.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">💬 {language === 'ru' ? 'Коротко' : 'In short'}</p>
                <ul className="mt-2 space-y-2">
                  {chestFlyGuideContent[language === 'ru' ? 'ru' : 'en'].shortTitle.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {baseRowGuideExerciseName && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setBaseRowGuideExerciseName(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">
                  {language === 'ru' ? 'Гайд по изоляции спины' : 'Back Isolation Guide'}
                </p>
                <button
                  type="button"
                  onClick={() => setBaseRowGuideExerciseName(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={language === 'ru' ? 'Закрыть гайд' : 'Close guide'}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {baseRowGuideContent[language === 'ru' ? 'ru' : 'en'].title}
              </h2>
              <p className="mt-2 text-sm text-[#3d3d45]">
                {language === 'ru' ? `Упражнение: ${localizeExerciseName(baseRowGuideExerciseName, language)}` : `Exercise: ${localizeExerciseName(baseRowGuideExerciseName, language)}`}
              </p>
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {baseRowGuideContent[language === 'ru' ? 'ru' : 'en'].sections.map((section) => (
                  <article key={section.title} className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4">
                    <h3 className="text-base font-semibold text-[#191923]">{section.title}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5e67]">
                      {language === 'ru' ? 'Выбор' : 'Choose'}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-[#40404d]">
                      {section.choose.map((item) => renderGuideChooseItem(section.title, item))}
                    </ul>
                    {section.why && (
                      <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">{language === 'ru' ? '👉 Разница:' : '👉 Difference:'}</span> {section.why}</p>
                    )}
                    <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">👉 {language === 'ru' ? 'Фокус:' : 'Focus:'}</span> {section.focus}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">
                  {baseRowGuideContent[language === 'ru' ? 'ru' : 'en'].quickTitle}
                </p>
                <ul className="mt-2 space-y-2">
                  {baseRowGuideContent[language === 'ru' ? 'ru' : 'en'].quickLines.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">💬 {language === 'ru' ? 'Коротко' : 'In short'}</p>
                <ul className="mt-2 space-y-2">
                  {baseRowGuideContent[language === 'ru' ? 'ru' : 'en'].shortTitle.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {pullUpGuideExerciseName && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setPullUpGuideExerciseName(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">
                  {language === 'ru' ? 'Гайд по подтягиваниям' : 'Pull-Up Guide'}
                </p>
                <button
                  type="button"
                  onClick={() => setPullUpGuideExerciseName(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={language === 'ru' ? 'Закрыть гайд' : 'Close guide'}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {pullUpGuideContent[language === 'ru' ? 'ru' : 'en'].title}
              </h2>
              <p className="mt-2 text-sm text-[#3d3d45]">
                {language === 'ru' ? `Упражнение: ${localizeExerciseName(pullUpGuideExerciseName, language)}` : `Exercise: ${localizeExerciseName(pullUpGuideExerciseName, language)}`}
              </p>
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {pullUpGuideContent[language === 'ru' ? 'ru' : 'en'].sections.map((section) => (
                  <article key={section.title} className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4">
                    <h3 className="text-base font-semibold text-[#191923]">{section.title}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5e67]">
                      {language === 'ru' ? 'Выбор' : 'Choose'}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-[#40404d]">
                      {section.choose.map((item) => renderGuideChooseItem(section.title, item))}
                    </ul>
                    {section.why && (
                      <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">{language === 'ru' ? '👉 Почему:' : '👉 Why:'}</span> {section.why}</p>
                    )}
                    <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">👉 {language === 'ru' ? 'Фокус:' : 'Focus:'}</span> {section.focus}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">
                  {pullUpGuideContent[language === 'ru' ? 'ru' : 'en'].quickTitle}
                </p>
                <ul className="mt-2 space-y-2">
                  {pullUpGuideContent[language === 'ru' ? 'ru' : 'en'].quickLines.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">💬 {language === 'ru' ? 'Коротко' : 'In short'}</p>
                <ul className="mt-2 space-y-2">
                  {pullUpGuideContent[language === 'ru' ? 'ru' : 'en'].shortTitle.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {legPressGuideExerciseName && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setLegPressGuideExerciseName(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">
                  {language === 'ru' ? 'Гайд по жиму ногами' : 'Leg Press Guide'}
                </p>
                <button
                  type="button"
                  onClick={() => setLegPressGuideExerciseName(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={language === 'ru' ? 'Закрыть гайд' : 'Close guide'}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {legPressGuideContent[language === 'ru' ? 'ru' : 'en'].title}
              </h2>
              <p className="mt-2 text-sm text-[#3d3d45]">
                {language === 'ru' ? `Упражнение: ${localizeExerciseName(legPressGuideExerciseName, language)}` : `Exercise: ${localizeExerciseName(legPressGuideExerciseName, language)}`}
              </p>
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <div className="space-y-3">
                {legPressGuideContent[language === 'ru' ? 'ru' : 'en'].sections.map((section) => (
                  <article key={section.title} className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4">
                    <h3 className="text-base font-semibold text-[#191923]">{section.title}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5e5e67]">
                      {language === 'ru' ? 'Выбор' : 'Choose'}
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-[#40404d]">
                      {section.choose.map((item) => renderGuideChooseItem(section.title, item))}
                    </ul>
                    {section.why && (
                      <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">{language === 'ru' ? '👉 Почему:' : '👉 Why:'}</span> {section.why}</p>
                    )}
                    <p className="mt-2 text-sm text-[#40404d]"><span className="font-semibold">👉 {language === 'ru' ? 'Фокус:' : 'Focus:'}</span> {section.focus}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">
                  {legPressGuideContent[language === 'ru' ? 'ru' : 'en'].quickTitle}
                </p>
                <ul className="mt-2 space-y-2">
                  {legPressGuideContent[language === 'ru' ? 'ru' : 'en'].quickLines.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">💬 {language === 'ru' ? 'Коротко' : 'In short'}</p>
                <ul className="mt-2 space-y-2">
                  {legPressGuideContent[language === 'ru' ? 'ru' : 'en'].shortTitle.map((line) => (
                    <li key={line} className="text-sm text-[#40404d]">{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeExercise && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b0b0c]/55 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={() => setActiveExercise(null)}
          role="presentation"
        >
          <div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#dadadd] bg-gradient-to-b from-[#f9f9fb] via-[#f4f4f6] to-[#efeff2] shadow-[0_20px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#dddee3] bg-[#f7f7f9]/95 px-4 pb-3 pt-4 backdrop-blur sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60606a]">{t('workoutBuilder.exerciseTechnique')}</p>
                <button
                  type="button"
                  onClick={() => setActiveExercise(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfd0d6] bg-white text-[#111111] transition hover:bg-[#f0f1f4]"
                  aria-label={t('workoutBuilder.closeTechnique')}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="text-2xl font-semibold leading-tight text-[#0f0f10] sm:text-[30px]">
                {activeExercise.icon ? `${activeExercise.icon} ` : ''}{localizeExerciseName(activeExercise.name, language)}
              </h2>
              {isDeadliftGuideExercise(activeExercise.name) && (
                <button
                  type="button"
                  onClick={() => openGuide('deadlift', activeExercise.name)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                >
                  <BookOpen size={14} />
                  {language === 'ru' ? 'Как выбрать тягу под цель?' : 'How to Choose the Right Deadlift'}
                </button>
              )}
              {isPressGuideExercise(activeExercise.name) && (
                <button
                  type="button"
                  onClick={() => openGuide('press', activeExercise.name)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                >
                  <BookOpen size={14} />
                  {language === 'ru' ? 'Как выбрать жим под себя' : 'How to Choose the Right Press'}
                </button>
              )}
              {isPushUpGuideExercise(activeExercise.name) && (
                <button
                  type="button"
                  onClick={() => openGuide('push-up', activeExercise.name)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                >
                  <BookOpen size={14} />
                  {language === 'ru' ? 'Как выбрать отжимания под себя' : 'How to Choose Push-Ups'}
                </button>
              )}
              {isChestFlyGuideExercise(activeExercise.name) && (
                <button
                  type="button"
                  onClick={() => openGuide('chest-fly', activeExercise.name)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                >
                  <BookOpen size={14} />
                  {language === 'ru' ? 'Как выбрать сведения под себя' : 'How to Choose Chest Fly Variations'}
                </button>
              )}
              {isBaseRowGuideExercise(activeExercise.name) && (
                <button
                  type="button"
                  onClick={() => openGuide('base-row', activeExercise.name)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                >
                  <BookOpen size={14} />
                  {language === 'ru' ? 'Как выбрать тягу под себя (изоляция и детализация спины)' : 'How to Choose a Back Isolation Exercise'}
                </button>
              )}
              {isPullUpGuideExercise(activeExercise.name) && (
                <button
                  type="button"
                  onClick={() => openGuide('pull-up', activeExercise.name)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                >
                  <BookOpen size={14} />
                  {language === 'ru' ? 'Как выбрать подтягивания под себя' : 'How to Choose Pull-Ups'}
                </button>
              )}
              {isLegPressGuideExercise(activeExercise.name) && (
                <button
                  type="button"
                  onClick={() => openGuide('leg-press', activeExercise.name)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#fff3d9] px-3 py-1.5 text-xs font-semibold text-[#111111]"
                >
                  <BookOpen size={14} />
                  {language === 'ru' ? 'Как выбрать жим ногами под себя' : 'How to Choose a Leg Press'}
                </button>
              )}
            </div>

            <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
              <ExerciseVideo videoUrl={activeExercise.videoUrl} title={localizeExerciseName(activeExercise.name, language)} />

              <div className="mt-4 rounded-2xl border border-[#d8d8de] bg-white/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">{t('workoutBuilder.musclesInvolved')}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#383844]">
                  {localizeMusclesText(activeExercise.muscles, language) || t('workoutBuilder.primaryTargetMuscles')}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">{t('workoutBuilder.technique')}</p>
                <div className="mt-3 space-y-3">
                  {activeTechniqueBlocks.steps.map((step) => (
                    <article
                      key={`${activeExercise.name}-${step.title}`}
                      className="rounded-2xl border border-[#d8d9df] bg-white/85 p-4"
                    >
                      <h3 className="text-base font-semibold text-[#191923]">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#40404d]">{step.description}</p>
                    </article>
                  ))}
                </div>
              </div>

              {activeTechniqueBlocks.keyPoints.length > 0 && (
                <div className="mt-4 rounded-2xl border border-[#d8d9df] bg-[#ffffffcc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5e5e67]">{t('workoutBuilder.keyPoints')}</p>
                  <ul className="mt-2 space-y-2">
                    {activeTechniqueBlocks.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-[#40404d]">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[#111111]" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
