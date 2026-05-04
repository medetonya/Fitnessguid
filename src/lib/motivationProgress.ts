import { supabase } from './supabase'

export type MotivationLanguage = 'ru' | 'en'

interface MotivationMessage {
  title: string
  description: string
  emotion: string
}

const motivationMessagesRu: MotivationMessage[] = [
  { title: 'СИГНАЛ ЗАПУЩЕН', description: 'Тело выходит из режима покоя', emotion: 'Ты начал изменения' },
  { title: 'ПЕРВЫЙ ОТКЛИК', description: 'Мышцы реагируют быстрее', emotion: 'Ты становишься собраннее' },
  { title: 'ЭНЕРГИЯ МЕНЯЕТСЯ', description: 'Организм работает эффективнее', emotion: 'Усталость уже мягче' },
  { title: 'СВЯЗЬ РАСТЁТ', description: 'Мозг и тело синхронизируются', emotion: 'Появляется контроль' },
  { title: 'ФОРМА ПРОСЫПАЕТСЯ', description: 'Движения становятся осознанными', emotion: 'Ты управляешь телом' },
  { title: 'АДАПТАЦИЯ СТАРТУЕТ', description: 'Тело понимает систему', emotion: 'Изменения закрепляются' },
  { title: 'СТРУКТУРА ПОЯВЛЯЕТСЯ', description: 'Движения становятся стабильнее', emotion: 'Ты чувствуешь основу' },
  { title: 'ВОССТАНОВЛЕНИЕ УСКОРЯЕТСЯ', description: 'Организм быстрее приходит в норму', emotion: 'Ты не ломаешься' },
  { title: 'ЭНЕРГИЯ ЭКОНОМИТСЯ', description: 'Меньше затрат - больше результата', emotion: 'Ты чувствуешь лёгкость' },
  { title: 'ДВИЖЕНИЯ ЧИЩЕ', description: 'Лишнее напряжение уходит', emotion: 'Ты двигаешься точнее' },
  { title: 'ВИДИМЫЕ ИЗМЕНЕНИЯ', description: 'Тело начинает выглядеть иначе', emotion: 'Ты это замечаешь' },
  { title: 'РЕЖИМ ЗАКРЕПЛЯЕТСЯ', description: 'Тренировки становятся нормой', emotion: 'Ты вошёл в систему' },
  { title: 'СИЛА РАСТЁТ', description: 'Тело становится плотнее', emotion: 'Ты чувствуешь мощь' },
  { title: 'КОНТРОЛЬ УСИЛЕН', description: 'Движения точные', emotion: 'Ты управляешь, не борешься' },
  { title: 'БЫСТРОЕ ВОССТАНОВЛЕНИЕ', description: 'Усталость проходит быстрее', emotion: 'Ты возвращаешься сильнее' },
  { title: 'АДАПТАЦИЯ ГЛУБЖЕ', description: 'Тело запоминает нагрузку', emotion: 'Ты уже не новичок' },
  { title: 'СТАБИЛЬНОСТЬ', description: 'Тело работает ровно', emotion: 'Ты чувствуешь базу' },
  { title: 'НОВЫЙ УРОВЕНЬ', description: 'Это твоя новая норма', emotion: 'Ты уже другой' },
  { title: 'СИСТЕМА ВКЛЮЧЕНА', description: 'Тело работает как единое целое', emotion: 'Ты стабилен' },
  { title: 'ЭНЕРГИЯ ПОД КОНТРОЛЕМ', description: 'Ты не устаёшь хаотично', emotion: 'Ты управляешь ресурсом' },
  { title: 'УВЕРЕННОСТЬ', description: 'Движения становятся естественными', emotion: 'Ты чувствуешь уверенность' },
  { title: 'СИЛА + КОНТРОЛЬ', description: 'Баланс тела усиливается', emotion: 'Ты управляешь нагрузкой' },
  { title: 'СТАБИЛЬНЫЙ ПРОГРЕСС', description: 'Изменения постоянны', emotion: 'Ты движешься вперёд' },
  { title: 'НОВАЯ ФОРМА', description: 'Тело выглядит иначе', emotion: 'Ты это ощущаешь' },
  { title: 'ОПТИМИЗАЦИЯ', description: 'Тело убирает лишнее', emotion: 'Ты двигаешься проще' },
  { title: 'ЭФФЕКТИВНОСТЬ', description: 'Меньше усилий - больше результата', emotion: 'Ты становишься умнее физически' },
  { title: 'ВЫНОСЛИВОСТЬ', description: 'Ты держишь нагрузку', emotion: 'Ты не сдаёшься' },
  { title: 'УСТОЙЧИВОСТЬ', description: 'Тело стабильно', emotion: 'Ты не откатываешься' },
  { title: 'СИЛА РАСТЁТ', description: 'Ты становишься мощнее', emotion: 'Ты это чувствуешь' },
  { title: 'КОНТРОЛЬ ТЕЛА', description: 'Ты управляешь движением', emotion: 'Ты уверен' },
  { title: 'СПОРТИВНОЕ СОСТОЯНИЕ', description: 'Тело работает как у спортсмена', emotion: 'Это уже база' },
  { title: 'СТАБИЛЬНАЯ ФОРМА', description: 'Результат держится', emotion: 'Ты закрепился' },
  { title: 'УРОВЕНЬ ВЫШЕ', description: 'Ты сильнее, чем раньше', emotion: 'Это видно' },
  { title: 'КОНТРОЛЬ И СИЛА', description: 'Баланс усиливается', emotion: 'Ты уверен в теле' },
  { title: 'ФИНАЛЬНАЯ СТАДИЯ', description: 'Ты закрепляешь результат', emotion: 'Это твой уровень' },
  { title: 'НОВАЯ НОРМА', description: 'Тело стало другим', emotion: 'Назад уже нет' },
]

const motivationMessagesEn: MotivationMessage[] = [
  { title: 'SYSTEM ACTIVATED', description: 'Your body exits rest mode', emotion: 'You started the change' },
  { title: 'FIRST RESPONSE', description: 'Muscles react faster', emotion: 'You feel more focused' },
  { title: 'ENERGY REWIRED', description: 'Your body works more efficiently', emotion: 'Fatigue is softer' },
  { title: 'CONNECTION BUILDS', description: 'Brain and body sync', emotion: 'You feel control' },
  { title: 'FORM AWAKENS', description: 'Movements become intentional', emotion: "You're in control" },
  { title: 'ADAPTATION STARTS', description: 'Your body understands the system', emotion: 'Changes begin to stick' },
  { title: 'STRUCTURE BUILDS', description: 'Movements stabilize', emotion: 'You feel the base' },
  { title: 'FASTER RECOVERY', description: 'Your body resets quicker', emotion: "You don't break down" },
  { title: 'ENERGY EFFICIENCY', description: 'Less effort, more output', emotion: 'You feel lighter' },
  { title: 'CLEAN MOVEMENT', description: 'Tension drops', emotion: 'You move better' },
  { title: 'VISIBLE CHANGE', description: 'Your body looks different', emotion: 'You notice it' },
  { title: 'SYSTEM LOCKED', description: 'Training becomes normal', emotion: "You're in the flow" },
  { title: 'STRENGTH RISES', description: 'Your body feels denser', emotion: 'You feel power' },
  { title: 'CONTROL IMPROVES', description: 'Movements are precise', emotion: "You're in control" },
  { title: 'FAST RECOVERY', description: 'Fatigue fades quicker', emotion: 'You bounce back' },
  { title: 'DEEP ADAPTATION', description: 'Your body learns load', emotion: "You're not a beginner" },
  { title: 'STABILITY', description: 'Your body works smoothly', emotion: 'You feel solid' },
  { title: 'NEW LEVEL', description: 'This is your new base', emotion: "You've changed" },
  { title: 'SYSTEM MODE', description: 'Body works as one', emotion: "You're stable" },
  { title: 'ENERGY CONTROL', description: 'Fatigue is managed', emotion: 'You control effort' },
  { title: 'CONFIDENCE', description: 'Movement feels natural', emotion: 'You feel strong' },
  { title: 'POWER + CONTROL', description: 'Balance improves', emotion: 'You control load' },
  { title: 'CONSISTENT PROGRESS', description: 'Change is steady', emotion: 'You move forward' },
  { title: 'NEW FORM', description: 'Your body looks different', emotion: 'You feel it' },
  { title: 'OPTIMIZATION', description: 'Body removes waste', emotion: 'You move simpler' },
  { title: 'EFFICIENCY', description: 'Less effort, more result', emotion: 'You move smarter' },
  { title: 'ENDURANCE', description: 'You handle load', emotion: "You don't quit" },
  { title: 'STABILITY', description: 'Body holds progress', emotion: 'No regression' },
  { title: 'STRENGTH UP', description: "You're stronger", emotion: 'You feel it' },
  { title: 'BODY CONTROL', description: 'You command movement', emotion: "You're confident" },
  { title: 'ATHLETIC STATE', description: 'Body performs like an athlete', emotion: 'This is your base' },
  { title: 'STABLE FORM', description: 'Result holds', emotion: "You're locked in" },
  { title: 'NEXT LEVEL', description: "You're stronger than before", emotion: 'It shows' },
  { title: 'CONTROL + POWER', description: 'Balance improves', emotion: 'You trust your body' },
  { title: 'FINAL PHASE', description: 'You lock the result', emotion: 'This is your level' },
  { title: 'NEW NORMAL', description: 'Your body changed', emotion: 'No going back' },
]

const clampDay = (day: number) => Math.min(36, Math.max(1, day))

export const getMotivationMessage = (day: number, language: MotivationLanguage) => {
  const index = clampDay(day) - 1
  const list = language === 'ru' ? motivationMessagesRu : motivationMessagesEn
  return list[index]
}

export const getMotivationRewardHint = (language: MotivationLanguage) => {
  return language === 'ru'
    ? 'Занимайся минимум 1 месяц (2 тренировки в неделю), чтобы получить награду'
    : 'Train consistently for 1 month (2 workouts per week) to unlock a reward'
}

export interface MotivationProgress {
  workoutsCompleted: number
  currentDay: number
}

export const incrementMotivationProgress = async (_userId?: string): Promise<MotivationProgress> => {
  const { data, error } = await supabase.rpc('increment_motivation_progress')

  if (error) {
    throw error
  }

  const row = Array.isArray(data) ? data[0] : data

  return {
    workoutsCompleted: Number(row?.workouts_completed ?? 0),
    currentDay: Number(row?.current_day ?? 0),
  }
}
