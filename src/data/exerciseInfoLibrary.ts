import type { BuilderExerciseTag } from '../components/ExerciseBuilderScreen'
import { resolveExerciseContentKey } from '../lib/exerciseContentKeyResolver'

export interface ExerciseInfo {
  muscles: string
  technique: string
}

const normalizeExerciseName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const exerciseInfoMap: Record<string, ExerciseInfo> = {
  [normalizeExerciseName('Cable Lateral Raise')]: {
    muscles: 'Middle deltoid, upper trapezius',
    technique:
      '1. Setup\nStand side-on to the cable stack with the pulley at the lowest position. Hold the handle with the far hand.\n2. Body Position\nKeep your torso stable and core engaged. Slight elbow bend, locked in place.\n3. Raise\nRaise the arm out to the side to shoulder height. Lead with the elbow.\n4. Top Position\nPause briefly at the top without shrugging the shoulder.\n5. Lower\nLower slowly under control and avoid swinging.\n\nKey points:\n- Constant cable tension throughout the entire range of motion — no rest at the bottom.\n- Do not shrug your shoulder at the top; keep it depressed.\n- Slightly tilt the pinky side upward at the top for better delt activation.',
  },
  [normalizeExerciseName('Straight-arm Pulldown (rope)')]: {
    muscles: 'Lats',
    technique:
      '1. Setup\nStand facing the cable machine and grab the rope attachment with both hands, arms extended at shoulder height.\n2. Body Position\nMaintain a slight forward lean, soft knees, and engaged core. Arms nearly straight with minimal elbow bend.\n3. Execution\nPull the rope downward in an arc toward your hips, spreading the ends apart at the bottom for extra lat contraction.\n4. Peak Contraction\nSqueeze your lats at the bottom and hold briefly. Spread the rope ends to maximize the squeeze.\n5. Return\nRaise the rope back to shoulder height under control, letting lats stretch fully.\n\nKey points:\n- Spread the rope at the bottom for a stronger peak contraction.\n- Keep elbows nearly locked — do not turn this into a triceps pushdown.\n- Use a weight that allows full range without torso swinging.',
  },
  [normalizeExerciseName('Dumbbell Pullover')]: {
    muscles: 'Chest, serratus anterior, lats',
    technique:
        '1. Setup\nLie across a flat bench with your upper back supported. Hold one dumbbell with both hands over your chest, arms slightly bent.\n2. Starting Position\nPlant feet firmly on the floor and keep hips slightly lower than the bench for a good stretch.\n3. Lowering Phase\nSlowly lower the dumbbell behind your head in an arc, keeping the slight elbow bend. Stop when you feel a deep stretch in your chest and lats.\n4. Pulling Phase\nPull the dumbbell back to the starting position over your chest, driving the movement with controlled shoulder extension.\n5. Breathing\nInhale as you lower the weight behind your head, exhale as you pull it back over your chest.\n\nKey points:\n- Keep a slight bend in the elbows throughout — do not straighten or bend them further during the movement.\n- Lower the hips slightly below bench level to increase the stretch.\n- Focus on chest stretch and control through the full arc, without turning it into a press.',
  },
  [normalizeExerciseName('Barbell Pullover')]: {
    muscles: 'Chest, serratus anterior, lats',
    technique:
      '1. Setup\nLie flat on a bench with your head near the edge. Grip the barbell with a narrow overhand grip, arms extended over your chest.\n2. Starting Position\nKeep feet flat on the floor, core braced, and a slight bend in your elbows.\n3. Lowering Phase\nLower the barbell behind your head in a controlled arc until you feel a strong stretch in lats and chest.\n4. Pulling Phase\nDrive the barbell back over your chest using your lats. Keep the elbow angle fixed throughout.\n5. Finish\nReturn to the start position and squeeze your lats before the next rep.\n\nKey points:\n- Do not bend the elbows further as you lower the bar — maintain a fixed angle.\n- Keep your lower back from arching excessively off the bench.\n- Use moderate weight to maintain control through the full range of motion.',
  },
  [normalizeExerciseName('Hyperextensions (Back Extensions)')]: {
    muscles: 'Lower back, glutes, hamstrings',
    technique:
      '1. Setup\nPosition your hips on the pad so your upper body can freely hinge. Lock your feet under the foot supports.\n2. Starting Position\nCross arms over chest or place hands behind your head. Keep spine neutral.\n3. Lowering Phase\nHinge at the hips and lower your torso toward the floor in a controlled motion. Do not round your back.\n4. Lifting Phase\nRaise your torso back to a straight line by contracting your glutes and lower back. Do not hyperextend past neutral.\n5. Breathing\nInhale on the way down, exhale as you lift.\n\nKey points:\n- Do not swing or use momentum — keep the movement slow and controlled.\n- Stop at a neutral spine at the top; going too far back puts pressure on your lower spine.\n- Squeeze your glutes at the top for maximum engagement.',
  },
  [normalizeExerciseName('Superman Raises')]: {
    muscles: 'Lower back, glutes, posterior chain',
    technique:
      '1. Setup\nLie face down with arms extended overhead and legs straight behind you.\n2. Lift Phase\nRaise your arms, chest, and legs off the floor simultaneously by contracting your lower back and glutes.\n3. Top Position\nBriefly hold the raised position at the top, squeezing your lower back and glutes.\n4. Lower Phase\nLower everything back to the floor with control — do not drop.\n5. Repeat\nPerform each rep as a distinct lift-and-lower, maintaining quality throughout.\n\nKey points:\n- Unlike the Superman Hold, each rep is a separate lift-and-lower rather than a sustained hold.\n- Keep your head in a neutral position, looking down at the floor.\n- Focus on controlled reps rather than speed.',
  },
  [normalizeExerciseName('Inverted Rows')]: {
    muscles: 'Upper back, lats, rear delts, biceps',
    technique:
      '1. Setup\nSet a bar at waist height (Smith machine, squat rack, or sturdy table). Lie underneath and grab it with an overhand grip, slightly wider than shoulders.\n2. Body Position\nKeep your body in a straight line from head to heels, core braced, and glutes squeezed. Walk your feet forward to increase difficulty.\n3. Pull\nPull your chest toward the bar by driving your elbows back. Squeeze your shoulder blades together at the top.\n4. Top Position\nHold briefly with your chest close to the bar, maintaining the straight body line.\n5. Lower\nSlowly extend your arms to return to the starting position, keeping tension in your back.\n\nKey points:\n- Keep a straight line from head to heels — do not let hips sag or pike up.\n- Pull with your back muscles, not just your arms.\n- To make it easier, walk feet back (more upright); to make it harder, elevate your feet.',
  },
  [normalizeExerciseName('Barbell Biceps Curl')]: {
    muscles: 'Biceps, brachialis',
    technique:
      '1. Setup\nStand upright with feet shoulder-width apart. Grip the barbell with an underhand (supinated) grip, hands about shoulder-width apart.\n2. Starting Position\nLet the bar hang at arm\'s length in front of your thighs. Keep elbows close to your sides and shoulders relaxed.\n3. Curl\nCurl the bar upward by flexing at the elbows. Keep your upper arms stationary — only your forearms should move.\n4. Top Position\nSqueeze your biceps hard at the top for 1 second. Do not swing the bar or lean back.\n5. Lower\nSlowly lower the bar back to the starting position under full control.\n\nKey points:\n- Keep elbows pinned to your sides throughout — do not let them drift forward.\n- Avoid using momentum or swinging your torso to lift the weight.\n- Use a full range of motion: full extension at the bottom, full squeeze at the top.',
  },
  [normalizeExerciseName('Dumbbell Biceps Curl')]: {
    muscles: 'Biceps, brachialis',
    technique:
      '1. Setup\nStand upright holding a dumbbell in each hand at your sides, palms facing forward (supinated grip).\n2. Starting Position\nArms fully extended, elbows close to your torso, shoulders relaxed and down.\n3. Curl\nCurl both dumbbells upward simultaneously, keeping upper arms stationary. Rotate palms up if starting with neutral grip.\n4. Top Position\nSqueeze your biceps at the top for 1 second. Do not let elbows drift forward.\n5. Lower\nLower the dumbbells slowly and with control to full arm extension.\n\nKey points:\n- Keep your wrists straight — do not let them curl inward under load.\n- Avoid swinging or rocking your body to lift the weight.\n- Full range of motion on every rep: stretch at the bottom, squeeze at the top.',
  },
  [normalizeExerciseName('Hammer Curl')]: {
    muscles: 'Biceps, brachialis, brachioradialis',
    technique:
      '1. Setup\nStand upright holding a dumbbell in each hand with a neutral grip (palms facing each other).\n2. Starting Position\nArms fully extended at your sides, elbows close to your torso, shoulders down.\n3. Curl\nCurl both dumbbells upward simultaneously while keeping the neutral grip throughout. Do not rotate your wrists.\n4. Top Position\nSqueeze at the top for 1 second. Your thumbs should be pointing toward your shoulders.\n5. Lower\nLower the dumbbells slowly to full arm extension.\n\nKey points:\n- The neutral grip targets the brachialis and forearms more than a standard curl.\n- Keep elbows locked in place — do not let them swing forward.\n- Avoid swinging the body; if you need momentum, reduce the weight.',
  },
  [normalizeExerciseName('Concentration Curl')]: {
    muscles: 'Biceps (peak emphasis)',
    technique:
      '1. Setup\nSit on a bench with legs apart. Hold a dumbbell in one hand and brace the back of that arm\'s elbow against your inner thigh.\n2. Starting Position\nLet the arm hang fully extended with the dumbbell just off the floor.\n3. Curl\nCurl the dumbbell toward your shoulder by flexing at the elbow. Keep your upper arm pressed into your thigh throughout.\n4. Top Position\nSqueeze your bicep hard at the top for 1-2 seconds. Focus on the peak contraction.\n5. Lower\nSlowly lower the dumbbell back to full extension. Complete all reps, then switch arms.\n\nKey points:\n- The thigh brace eliminates cheating — use this for strict bicep isolation.\n- Turn your wrist slightly outward (supinate) at the top for extra peak contraction.\n- Use lighter weight than standing curls; this exercise is about quality, not load.',
  },
  [normalizeExerciseName('Cable Biceps Curl')]: {
    muscles: 'Biceps',
    technique:
      '1. Setup\nStand facing the cable machine with the pulley set at the lowest position. Attach a straight bar or EZ-bar handle.\n2. Starting Position\nGrip the bar with an underhand grip, arms fully extended, elbows at your sides.\n3. Curl\nCurl the bar upward by flexing at the elbows. Keep upper arms stationary and torso still.\n4. Top Position\nSqueeze your biceps at the top for 1 second. The constant cable tension makes this peak contraction very effective.\n5. Lower\nSlowly lower the bar back to full extension, resisting the cable pull.\n\nKey points:\n- Cables provide constant tension throughout the entire range — use this advantage.\n- Do not lean back or use body momentum to lift the weight.\n- Keep elbows fixed at your sides from start to finish.',
  },
  [normalizeExerciseName('Incline Dumbbell Curl')]: {
    muscles: 'Biceps (long head emphasis)',
    technique:
      '1. Setup\nSet a bench to a 45-60 degree incline. Sit back with a dumbbell in each hand, arms hanging straight down.\n2. Starting Position\nLet your arms fully extend. The incline stretches the long head of the biceps more than standing curls.\n3. Curl\nCurl both dumbbells upward, keeping elbows pointing straight down. Do not let them drift forward.\n4. Top Position\nSqueeze your biceps at the top for 1 second. Keep your back pressed against the bench.\n5. Lower\nSlowly lower the dumbbells back to full extension, feeling the stretch.\n\nKey points:\n- The incline pre-stretches the long head of the biceps for better activation.\n- Do not let your elbows move forward — they should point straight at the floor.\n- Use lighter weight than standing curls; the stretch makes this exercise harder.',
  },
  [normalizeExerciseName('EZ-Bar Curl')]: {
    muscles: 'Biceps, brachialis',
    technique:
      '1. Setup\nStand upright and grip the EZ-bar on the angled sections, hands about shoulder-width apart.\n2. Starting Position\nArms fully extended, bar at thigh level, elbows close to your sides.\n3. Curl\nCurl the bar upward in a smooth arc, keeping upper arms stationary. The EZ-bar angle reduces wrist strain.\n4. Top Position\nSqueeze biceps at the top for 1 second. Do not swing or lean back.\n5. Lower\nLower the bar slowly to full extension with control.\n\nKey points:\n- The angled grip reduces wrist and forearm strain compared to a straight bar.\n- Keep elbows pinned — all movement should come from the forearms.\n- If you feel wrist pain with straight bar curls, EZ-bar is the better alternative.',
  },
  [normalizeExerciseName('Reverse Curl')]: {
    muscles: 'Brachialis, brachioradialis, forearms',
    technique:
      '1. Setup\nStand upright and grip a barbell or EZ-bar with an overhand (pronated) grip, hands shoulder-width apart.\n2. Starting Position\nArms fully extended, bar at thigh level, elbows at your sides.\n3. Curl\nCurl the bar upward by flexing at the elbows. Keep wrists straight and firm — do not let them bend.\n4. Top Position\nSqueeze at the top for 1 second. You should feel the forearms and outer biceps working.\n5. Lower\nLower the bar slowly to full extension.\n\nKey points:\n- The overhand grip shifts emphasis to the brachialis and forearms.\n- Use lighter weight than regular curls — forearms fatigue faster.\n- Keep wrists straight and locked; do not curl them inward.',
  },
  [normalizeExerciseName('Close-Grip Bench Press')]: {
    muscles: 'Triceps, chest, anterior delts',
    technique:
      '1. Setup\nLie on a flat bench and grip the barbell with hands about shoulder-width apart or slightly narrower.\n2. Unrack\nUnrack the bar with arms extended. Position the bar over your upper chest with elbows tucked close to your body.\n3. Lowering Phase\nLower the bar to your lower chest/sternum area, keeping elbows close to your sides at about 30-45 degrees.\n4. Press\nPress the bar back up by extending your elbows. Focus on the triceps driving the movement.\n5. Lockout\nFully extend your arms at the top without flaring the elbows. Squeeze triceps, then repeat.\n\nKey points:\n- Keep elbows tight to your body — this shifts the work from chest to triceps.\n- Do not go too narrow with the grip (it strains wrists); shoulder-width is sufficient.\n- Lower the bar slowly; press up explosively.',
  },
  [normalizeExerciseName('Triceps Pushdown (Cable)')]: {
    muscles: 'Triceps (lateral and medial heads)',
    technique:
      '1. Setup\nStand facing the cable machine with the pulley at the top. Attach a straight bar, V-bar, or rope handle.\n2. Starting Position\nGrip the attachment with an overhand grip. Pull it down to chest level with elbows pinned to your sides.\n3. Push Down\nExtend your arms downward by straightening your elbows. Keep upper arms completely stationary.\n4. Bottom Position\nFully extend your arms and squeeze your triceps hard for 1 second. Lock out without snapping your elbows.\n5. Return\nSlowly let the handle rise back to chest level, resisting the cable tension.\n\nKey points:\n- Upper arms must stay still — all movement comes from the forearms.\n- Stand upright with a slight forward lean; do not hunch over the cable.\n- Squeeze hard at the bottom for maximum triceps activation.',
  },
  [normalizeExerciseName('Overhead Triceps Extension (DB)')]: {
    muscles: 'Triceps (long head emphasis)',
    technique:
      '1. Setup\nStand or sit upright. Hold one dumbbell with both hands behind your head, gripping the inner plate with palms up.\n2. Starting Position\nArms above your head, elbows pointing forward and close to your ears. Core engaged.\n3. Lowering Phase\nLower the dumbbell behind your head by bending at the elbows. Keep upper arms vertical and stationary.\n4. Extension\nExtend your arms back up by pressing the dumbbell toward the ceiling. Squeeze your triceps at the top.\n5. Repeat\nMaintain the elbow position throughout — they should not flare outward.\n\nKey points:\n- The overhead position stretches the long head of the triceps for maximum activation.\n- Keep elbows pointing forward, not outward.\n- Use a controlled tempo; do not let the weight drop behind your head.',
  },
  [normalizeExerciseName('Cable Overhead Extension')]: {
    muscles: 'Triceps (long head emphasis)',
    technique:
      '1. Setup\nSet the cable pulley to the lowest position with a rope attachment. Face away from the machine.\n2. Starting Position\nHold the rope behind your head with elbows bent and pointing forward. Take a split stance for stability.\n3. Extension\nExtend your arms forward and upward by straightening your elbows. Keep upper arms next to your head.\n4. Peak Contraction\nFully extend your arms and squeeze your triceps for 1 second. Separate the rope ends for extra contraction.\n5. Return\nSlowly let the rope pull your hands back behind your head. Control the negative.\n\nKey points:\n- The cable provides constant tension, especially in the stretched position.\n- Keep elbows pointing forward and close to your head throughout.\n- Lean slightly forward to maintain balance and increase range of motion.',
  },
  [normalizeExerciseName('Dumbbell Skull Crushers')]: {
    muscles: 'Triceps (all three heads)',
    technique:
      '1. Setup\nLie flat on a bench holding a dumbbell in each hand with a neutral grip, arms extended over your chest.\n2. Starting Position\nArms fully extended, dumbbells above your head. Palms face each other.\n3. Lowering Phase\nBend at the elbows to lower the dumbbells toward the sides of your head. Keep upper arms vertical.\n4. Extension\nPress the dumbbells back up by extending your elbows. Squeeze triceps at the top.\n5. Repeat\nFocus on a slow and controlled lowering phase.\n\nKey points:\n- The neutral grip is easier on the wrists than a barbell variation.\n- Keep upper arms still — do not let elbows flare or drift.\n- Use lighter weight than barbell skull crushers for better control.',
  },
  [normalizeExerciseName('Bench Dips')]: {
    muscles: 'Triceps, anterior delts, chest',
    technique:
      '1. Setup\nPlace your hands on the edge of a bench behind you, fingers forward. Extend your legs in front with heels on the floor.\n2. Starting Position\nArms fully extended, supporting your body weight. Core engaged.\n3. Lowering Phase\nBend your elbows to lower your body downward. Keep elbows pointing straight back, not outward.\n4. Depth\nLower until your elbows reach about 90 degrees. Do not go too deep if you feel shoulder discomfort.\n5. Press Up\nPush through your palms to extend your arms and return to the starting position.\n\nKey points:\n- Keep elbows pointing back, not out to the sides.\n- The closer your feet are to the bench, the easier the exercise. Extend legs further for more difficulty.\n- Do not dip too deep — going past 90 degrees places excessive stress on the shoulders.',
  },
  [normalizeExerciseName('Kickbacks (Dumbbell)')]: {
    muscles: 'Triceps (lateral head emphasis)',
    technique:
      '1. Setup\nPlace one hand and knee on a bench for support. Hold a dumbbell in the other hand.\n2. Starting Position\nBend your working arm to 90 degrees at the elbow, upper arm parallel to your torso.\n3. Extension\nExtend your arm backward by straightening the elbow. Keep the upper arm locked in position.\n4. Peak Contraction\nFully extend the arm and squeeze your tricep hard for 1-2 seconds at the top.\n5. Return\nSlowly bend the elbow back to 90 degrees. Do not swing the weight.\n\nKey points:\n- Upper arm stays parallel to the floor at all times — only the forearm moves.\n- Squeeze hard at full extension for maximum peak contraction.\n- Use lighter weight and strict form — this is an isolation exercise, not a power lift.',
  },
  [normalizeExerciseName('Cable Kickbacks')]: {
    muscles: 'Triceps (lateral head emphasis)',
    technique:
      '1. Setup\nSet the cable pulley to the lowest position. Stand facing the machine, lean forward slightly, and grip the handle with one hand.\n2. Starting Position\nBend your arm to 90 degrees, upper arm parallel to your torso. Keep the other hand on the machine for support.\n3. Extension\nExtend your arm backward by straightening the elbow. Keep the upper arm stationary.\n4. Peak Contraction\nPause at full extension and squeeze the tricep for 1-2 seconds.\n5. Return\nSlowly bend the elbow back to 90 degrees, resisting the cable tension.\n\nKey points:\n- The cable provides constant tension, unlike dumbbells where tension drops at the bottom.\n- Keep upper arm parallel to the floor — do not let it drop.\n- Control the negative phase — do not let the cable snap the weight back.',
  },
  [normalizeExerciseName('Single-Arm Pushdown')]: {
    muscles: 'Triceps',
    technique:
      '1. Setup\nStand at the cable machine with the pulley at the top. Attach a single handle and grip it with one hand.\n2. Starting Position\nPull the handle down to chest level. Pin your elbow to your side and stand upright.\n3. Push Down\nExtend your arm downward by straightening the elbow. Focus the contraction on the working tricep.\n4. Bottom Position\nFully extend the arm and squeeze the tricep for 1 second.\n5. Return\nSlowly let the handle rise back to chest level under control. Complete all reps, then switch arms.\n\nKey points:\n- Single-arm work allows you to correct strength imbalances between arms.\n- Keep your torso still — do not rotate toward the working arm.\n- Focus on squeezing at the bottom rather than using heavy weight.',
  },
  [normalizeExerciseName('Rope Pushdown')]: {
    muscles: 'Triceps (lateral head emphasis)',
    technique:
      '1. Setup\nStand facing the cable machine with the pulley at the top and a rope attachment connected.\n2. Starting Position\nGrip the rope with both hands (palms facing each other). Pull it down to chest level with elbows pinned.\n3. Push Down\nExtend your arms downward and spread the rope ends apart at the bottom.\n4. Bottom Position\nFully extend and separate the rope for maximum contraction. Squeeze triceps for 1 second.\n5. Return\nSlowly let the rope rise back to chest level.\n\nKey points:\n- Spread the rope at the bottom — this rotation increases lateral head activation.\n- Keep elbows at your sides; do not let them drift forward.\n- Use a controlled rhythm; avoid jerky or explosive movements.',
  },
  [normalizeExerciseName('Machine Triceps Extension')]: {
    muscles: 'Triceps',
    technique:
      '1. Setup\nSit in the machine and adjust the seat so your elbows align with the rotation axis. Press your back against the pad.\n2. Starting Position\nGrip the handles with arms bent, elbows at about 90 degrees. Keep your back flat against the pad.\n3. Extension\nPush the handles downward by extending your elbows. Keep upper arms fixed against the pads.\n4. Bottom Position\nFully extend your arms and squeeze your triceps for 1 second.\n5. Return\nSlowly allow the handles to return to the starting position, resisting the weight.\n\nKey points:\n- The machine guides the movement path, making it ideal for beginners and burnout sets.\n- Focus on a slow eccentric (return) phase for maximum muscle tension.\n- Adjust the seat so your elbows are properly aligned with the pivot point.',
  },
  [normalizeExerciseName('Barbell Overhead Press')]: {
    muscles: 'Anterior delts, lateral delts, triceps',
    technique:
      '1. Setup\nStand with feet shoulder-width apart. Grip the barbell slightly wider than shoulder-width in front of your shoulders (front rack position).\n2. Starting Position\nBar rests on your upper chest/front delts. Elbows slightly in front of the bar. Core and glutes braced.\n3. Press\nPress the bar straight overhead, moving your head slightly back to clear the bar path. Drive the bar up and slightly backward.\n4. Lockout\nFully extend your arms with the bar directly above your head and mid-foot. Bring your head forward under the bar.\n5. Lower\nSlowly lower the bar back to the front rack position under control.\n\nKey points:\n- Keep your core and glutes tight to prevent lower back arching.\n- The bar path should be straight up — move your head out of the way, not the bar around your head.\n- Avoid excessive lean-back; this is a shoulder press, not an incline bench press.',
  },
  [normalizeExerciseName('Arnold Press')]: {
    muscles: 'Anterior delts, lateral delts, triceps',
    technique:
      '1. Setup\nSit on a bench with back support. Hold dumbbells at shoulder height with palms facing toward you (like the top of a curl).\n2. Starting Position\nDumbbells in front of your face, elbows in front of your body, palms facing you.\n3. Press and Rotate\nPress upward while simultaneously rotating your palms outward. Halfway up, palms should face to the sides.\n4. Top Position\nFully extend arms overhead with palms now facing forward. Squeeze briefly at the top.\n5. Lower and Rotate Back\nReverse the motion: lower the dumbbells while rotating palms back toward your face.\n\nKey points:\n- The rotation adds lateral delt engagement that a standard press misses.\n- Rotate smoothly throughout the press — do not rotate and then press separately.\n- Use lighter weight than a standard shoulder press due to the rotational component.',
  },
  [normalizeExerciseName('Machine Shoulder Press')]: {
    muscles: 'Anterior delts, lateral delts, triceps',
    technique:
      '1. Setup\nAdjust the seat so the handles are at shoulder height. Sit with your back firmly against the pad.\n2. Starting Position\nGrip the handles with palms forward and elbows at about 90 degrees.\n3. Press\nPress the handles upward until your arms are fully extended. Keep your back against the pad.\n4. Top Position\nSqueeze your shoulders at full extension for 1 second.\n5. Lower\nSlowly lower the handles back to shoulder height, controlling the weight.\n\nKey points:\n- The machine guides the path, making this safe for heavier loads and beginners.\n- Keep your back pressed against the pad throughout — do not arch off it.\n- Adjust the seat height so your elbows start at about 90 degrees.',
  },
  [normalizeExerciseName('Seated Dumbbell Press')]: {
    muscles: 'Anterior delts, lateral delts, triceps',
    technique:
      '1. Setup\nSit on a bench with back support set at 90 degrees. Hold a dumbbell in each hand at shoulder height.\n2. Starting Position\nDumbbells at shoulder level, palms forward, elbows at about 90 degrees.\n3. Press\nPress both dumbbells overhead until your arms are fully extended.\n4. Top Position\nBring dumbbells close together at the top (not touching). Squeeze delts briefly.\n5. Lower\nSlowly return to shoulder height under control.\n\nKey points:\n- The seated position removes leg drive, isolating the shoulders more.\n- Keep your lower back pressed against the pad — do not arch excessively.\n- Control the descent; do not let gravity drop the dumbbells.',
  },
  [normalizeExerciseName('Front Raise (DB/Plate/Barbell)')]: {
    muscles: 'Anterior delts',
    technique:
      '1. Setup\nStand upright holding dumbbells (or a plate/barbell) in front of your thighs with straight or slightly bent arms.\n2. Starting Position\nFeet shoulder-width apart, core engaged, slight bend in elbows locked in place.\n3. Raise\nLift the weight forward and upward to shoulder height. Keep arms nearly straight throughout.\n4. Top Position\nPause briefly at shoulder level. Do not raise higher than your shoulders.\n5. Lower\nSlowly lower the weight back to the starting position.\n\nKey points:\n- Raise to shoulder height only — going higher shifts work to the traps.\n- Keep your torso upright; do not lean back or swing the weight.\n- Use lighter weight — the anterior delts are a small muscle group.',
  },
  [normalizeExerciseName('Lateral Raise (Dumbbell)')]: {
    muscles: 'Lateral delts',
    technique:
      '1. Setup\nStand upright holding a dumbbell in each hand at your sides, palms facing inward.\n2. Starting Position\nSoft bend in elbows (about 15-20 degrees), locked in place. Shoulders down and relaxed.\n3. Raise\nLift both arms out to the sides in a wide arc until they reach shoulder height.\n4. Top Position\nPause briefly at shoulder level. Slightly tilt the pinky side of the dumbbell upward (like pouring water) for better delt activation.\n5. Lower\nSlowly lower the dumbbells back to your sides.\n\nKey points:\n- Lead with the elbows, not the hands — think about pushing your elbows out and up.\n- Do not raise above shoulder height; traps take over past that point.\n- Use light weight and strict form; swinging defeats the purpose of this exercise.',
  },
  [normalizeExerciseName('Cable Lateral Raise')]: {
    muscles: 'Lateral delts',
    technique:
      '1. Setup\nStand side-on to a cable machine with the pulley at the lowest position. Hold the handle with the far hand, cable crossing in front of your body.\n2. Starting Position\nArm at your side, slight elbow bend locked in place. Core engaged, torso stable.\n3. Raise\nLift your arm out to the side in a wide arc until it reaches shoulder height.\n4. Top Position\nPause briefly at shoulder height. Slightly tilt the pinky side upward for better delt activation.\n5. Lower\nSlowly lower the handle back to your side under control.\n\nKey points:\n- The cable provides constant tension throughout the range — unlike dumbbells, there is no rest at the bottom.\n- Do not lean or swing your torso to move the weight.\n- Keep your shoulder depressed (down); do not shrug at the top.',
  },
  [normalizeExerciseName('Rear Delt Dumbbell Fly')]: {
    muscles: 'Rear delts, upper back',
    technique:
      '1. Setup\nStand with feet shoulder-width apart, hinge forward at the hips to about 45-60 degrees. Hold dumbbells below your chest, palms facing each other.\n2. Starting Position\nArms hanging straight down with a slight bend in elbows. Back flat, core engaged.\n3. Raise\nLift both arms out to the sides in a wide arc, squeezing your rear delts and upper back.\n4. Top Position\nPause briefly when arms are in line with your torso. Squeeze shoulder blades together.\n5. Lower\nSlowly lower the dumbbells back to the starting position.\n\nKey points:\n- Keep the hinge angle constant — do not stand up as you raise the weights.\n- Focus on squeezing the shoulder blades together at the top.\n- Use light weight; the rear delts are a small muscle group that responds to control, not load.',
  },
  [normalizeExerciseName('Reverse Pec Deck')]: {
    muscles: 'Rear delts, rhomboids, upper back',
    technique:
      '1. Setup\nSit facing the machine with your chest against the pad. Adjust the handles so they are at shoulder height.\n2. Starting Position\nGrip the handles with arms slightly bent. Chest pressed firmly into the pad.\n3. Open\nPull the handles outward and backward in a wide arc, squeezing your rear delts and upper back.\n4. Peak Contraction\nPause when your arms are spread wide, shoulder blades squeezed together. Hold for 1 second.\n5. Return\nSlowly return the handles to the starting position, resisting the weight.\n\nKey points:\n- Keep your chest pressed against the pad — do not lean back during the movement.\n- Focus on squeezing the shoulder blades together rather than pulling with the arms.\n- Use a controlled tempo; this is not a power exercise.',
  },
  [normalizeExerciseName('Rear Delt Cable Fly')]: {
    muscles: 'Rear delts, upper back',
    technique:
      '1. Setup\nSet both cable pulleys to shoulder height. Stand between the cables and cross-grip (left hand holds right cable, right hand holds left cable).\n2. Starting Position\nArms crossed in front of your chest, slight bend in elbows.\n3. Pull Apart\nPull the cables outward and backward by driving your elbows apart. Squeeze rear delts and upper back.\n4. Peak Contraction\nPause with arms spread wide, shoulder blades squeezed together. Hold for 1 second.\n5. Return\nSlowly return to the crossed position under cable tension.\n\nKey points:\n- The cable provides constant tension, which is excellent for rear delt activation.\n- Keep elbows at shoulder height throughout — do not drop them.\n- Use lighter weight and focus on the squeeze, not the pull.',
  },
  [normalizeExerciseName('Upright Row (BB/DB/Cable)')]: {
    muscles: 'Lateral delts, traps',
    technique:
      '1. Setup\nStand upright holding a barbell, dumbbells, or cable handle in front of your thighs.\n2. Starting Position\nGrip is slightly narrower than shoulder-width. Arms extended, core engaged.\n3. Pull\nPull the weight upward along your body by leading with your elbows. Elbows should go out and up.\n4. Top Position\nStop when elbows reach shoulder height. Do not pull higher to avoid shoulder impingement.\n5. Lower\nSlowly lower the weight back to the starting position.\n\nKey points:\n- Lead with the elbows, not the hands — elbows should always be higher than wrists.\n- Use a wider grip (shoulder-width) to reduce impingement risk and target lateral delts more.\n- If you feel shoulder pain, switch to lateral raises instead.',
  },
  [normalizeExerciseName('Face Pulls')]: {
    muscles: 'Rear delts, external rotators, upper back',
    technique:
      '1. Setup\nSet the cable pulley to upper chest or face height. Attach a rope handle and grip the ends with an overhand grip.\n2. Starting Position\nStep back to create tension. Arms extended forward, elbows at shoulder height.\n3. Pull\nPull the rope toward your face by driving your elbows back and apart. Separate the rope ends as they approach your face.\n4. Peak Contraction\nFinish with your hands beside your ears, elbows high, and shoulder blades squeezed together. Hold for 1-2 seconds.\n5. Return\nSlowly extend arms back to the starting position.\n\nKey points:\n- This is one of the best exercises for shoulder health and posture — do it regularly.\n- Keep elbows high throughout; do not let them drop below shoulder level.\n- Focus on external rotation at the finish: hands beside ears, thumbs pointing back.',
  },
  [normalizeExerciseName('Barbell Shrugs')]: {
    muscles: 'Upper trapezius',
    technique:
      '1. Setup\nStand upright holding a barbell, dumbbells, or cable handle at arm\'s length by your sides/in front.\n2. Starting Position\nArms fully extended, shoulders relaxed and down, core engaged.\n3. Shrug\nElevate your shoulders straight up toward your ears as high as possible.\n4. Top Position\nSqueeze your traps hard at the top for 1-2 seconds.\n5. Lower\nSlowly lower your shoulders back to the starting position.\n\nKey points:\n- Move straight up and down — do not roll your shoulders (this adds no benefit and can injure the joint).\n- Hold the squeeze at the top for maximum trap activation.\n- Use straps if grip fails before traps are fatigued.',
  },
  [normalizeExerciseName('Dumbbell Shrugs')]: {
    muscles: 'Upper trapezius',
    technique:
      '1. Setup\nStand upright holding a dumbbell in each hand at your sides with arms extended.\n2. Starting Position\nKeep chest up, shoulders down, and core engaged. Let the dumbbells hang naturally.\n3. Shrug\nLift both shoulders straight up toward your ears as high as possible.\n4. Top Position\nPause and squeeze your traps for 1-2 seconds.\n5. Lower\nLower your shoulders slowly to the start position without bouncing.\n\nKey points:\n- Keep the movement vertical only; do not roll your shoulders.\n- Hold the top squeeze to increase trap activation.\n- Use straps if grip is limiting your working sets.',
  },
  [normalizeExerciseName('Cable Shrugs')]: {
    muscles: 'Upper trapezius',
    technique:
      '1. Setup\nAttach handles to low cable pulleys (or use a straight bar) and stand tall with the cables at your sides/in front.\n2. Starting Position\nArms extended, shoulders relaxed, and core braced. Maintain slight tension from the cables.\n3. Shrug\nElevate your shoulders straight up toward your ears under control.\n4. Top Position\nSqueeze your traps at the top for 1-2 seconds.\n5. Lower\nLower slowly, resisting the pull of the cable to keep tension on traps.\n\nKey points:\n- Cables keep tension at the bottom where free weights often unload.\n- Avoid torso sway and neck jutting; keep posture stacked.\n- Use controlled reps instead of chasing heavy loads.',
  },
  [normalizeExerciseName('Single-Arm Lateral Raise')]: {
    muscles: 'Lateral delts',
    technique:
      '1. Setup\nStand upright holding a dumbbell in one hand at your side. Hold onto something sturdy with the other hand for balance.\n2. Starting Position\nArm at your side with a slight elbow bend, palm facing inward.\n3. Raise\nLift the dumbbell out to the side in a wide arc until it reaches shoulder height.\n4. Top Position\nPause briefly at shoulder level. Slightly tilt the pinky end upward for better delt engagement.\n5. Lower\nSlowly return the dumbbell to your side. Complete all reps, then switch arms.\n\nKey points:\n- Single-arm work lets you focus entirely on one delt at a time.\n- Lean slightly away from the support for an increased range of motion.\n- Use the same weight and rep count on both sides to maintain balance.',
  },
  [normalizeExerciseName('Lean-Away Lateral Raise')]: {
    muscles: 'Lateral delts',
    technique:
      '1. Setup\nHold onto a sturdy support (pole, rack) with one hand. Hold a dumbbell in the other hand at your side.\n2. Starting Position\nLean your body away from the support, creating an angle. This increases the range of motion at the bottom of the lift.\n3. Raise\nLift the dumbbell out to the side until it reaches shoulder height.\n4. Top Position\nPause briefly at the top. Feel the full contraction in the lateral delt.\n5. Lower\nSlowly lower back to the starting position, keeping the lean angle consistent.\n\nKey points:\n- The lean increases the effective range of motion, keeping tension on the delt even at the bottom.\n- This variation is more challenging than standard lateral raises — use lighter weight.\n- Keep the lean angle constant; do not stand upright as you raise the weight.',
  },
  [normalizeExerciseName('Plate Front Raise')]: {
    muscles: 'Anterior delts, upper chest',
    technique:
      '1. Setup\nStand upright holding a weight plate with both hands at the 3 and 9 o\'clock positions, arms hanging in front of your thighs.\n2. Starting Position\nFeet shoulder-width apart, core engaged, slight bend in elbows.\n3. Raise\nLift the plate forward and upward to shoulder height, keeping arms nearly straight.\n4. Top Position\nPause at shoulder height for 1 second. Squeeze your front delts.\n5. Lower\nSlowly lower the plate back to the starting position.\n\nKey points:\n- The plate grip forces both arms to work together evenly.\n- Do not raise above shoulder height — traps take over past that point.\n- Keep your torso upright; avoid leaning back or swinging.',
  },
  [normalizeExerciseName('Cable Front Raise')]: {
    muscles: 'Anterior delts',
    technique:
      '1. Setup\nSet the cable pulley to the lowest position. Stand facing away from the machine and grip the handle between your legs or at your side.\n2. Starting Position\nArm extended down with slight elbow bend, cable taut with tension.\n3. Raise\nLift the handle forward and upward to shoulder height, keeping the arm nearly straight.\n4. Top Position\nPause at shoulder height for 1 second. The cable provides constant tension throughout.\n5. Lower\nSlowly lower back to the starting position, controlling the cable.\n\nKey points:\n- The cable keeps tension in the bottom position where dumbbells would be slack.\n- Use light weight — the constant tension makes this harder than it looks.\n- Alternate arms or do both with a straight bar attachment.',
  },
  [normalizeExerciseName('Y-Raises (Incline or Standing)')]: {
    muscles: 'Rear delts, lower traps, rotator cuff',
    technique:
      '1. Setup\nStand or lie face-down on an incline bench. Hold light dumbbells with thumbs pointing up.\n2. Starting Position\nArms hanging straight down, palms facing each other, thumbs up.\n3. Raise\nLifts arms upward and outward at about 45 degrees from your body, forming a Y-shape.\n4. Top Position\nPause when arms are in line with your torso. Squeeze the lower traps and rear delts.\n5. Lower\nSlowly return the dumbbells to the starting position.\n\nKey points:\n- Thumbs pointing up activates the external rotators and lower traps.\n- Use very light weight — this is a rehab/prehab exercise, not a strength builder.\n- Great warm-up exercise before heavy pressing. Include it regularly for shoulder health.',
  },
  [normalizeExerciseName('Barbell Bench Press')]: {
    muscles: 'Chest (pectorals), triceps, anterior delts',
    technique:
      '1. Setup\nLie flat on the bench with eyes under the bar. Feet flat on the floor, shoulder blades retracted and squeezed together.\n2. Grip\nGrip the bar slightly wider than shoulder-width. Unrack with arms fully extended over your upper chest.\n3. Lowering Phase\nSlowly lower the bar to your mid-chest (nipple line). Keep elbows at about 45 degrees to your torso.\n4. Press\nDrive the bar back up by pressing through your palms. Push your feet into the floor for a stable base.\n5. Lockout\nFully extend your arms at the top without losing your shoulder blade retraction.\n\nKey points:\n- Retract and depress your shoulder blades before unracking — they should stay pinched the entire set.\n- Keep your feet flat and drive them into the floor to create a stable base.\n- The bar touches your mid-chest, not your neck or stomach.',
  },
  [normalizeExerciseName('Dumbbell Bench Press')]: {
    muscles: 'Chest, triceps, anterior delts',
    technique:
      '1. Setup\nSit on the bench with dumbbells on your thighs. Lie back while using your thighs to help bring the dumbbells to chest level.\n2. Starting Position\nDumbbells at chest height, palms facing forward, shoulder blades retracted. Feet flat on the floor.\n3. Press\nPress both dumbbells upward until your arms are almost fully extended. Bring them slightly inward at the top.\n4. Top Position\nDumbbells close together at the top (not touching). Squeeze your chest briefly.\n5. Lower\nSlowly lower the dumbbells back to chest level, feeling a stretch in your pecs.\n\nKey points:\n- Dumbbells offer greater range of motion than a barbell, providing a deeper stretch.\n- Keep shoulder blades retracted throughout to protect the shoulders.\n- Lower under control — do not drop or bounce at the bottom.',
  },
  [normalizeExerciseName('Incline Barbell Bench Press')]: {
    muscles: 'Upper chest, anterior delts, triceps',
    technique:
      '1. Setup\nSet the bench to 30-45 degrees incline. Lie back with eyes under the bar. Retract your shoulder blades.\n2. Grip\nGrip the bar slightly wider than shoulder-width. Unrack with arms extended over your upper chest.\n3. Lowering Phase\nLower the bar toward your upper chest (clavicle area). Keep elbows at about 45 degrees.\n4. Press\nPress the bar back up in a slight arc toward your face/above your shoulders.\n5. Lockout\nFully extend your arms at the top while maintaining shoulder blade retraction.\n\nKey points:\n- The 30-degree incline optimally targets the upper chest; steeper angles shift work to the shoulders.\n- The bar path is slightly angled — it touches your upper chest and presses back over your shoulders.\n- Keep your butt on the bench throughout the set.',
  },
  [normalizeExerciseName('Incline Dumbbell Bench Press')]: {
    muscles: 'Upper chest, anterior delts, triceps',
    technique:
      '1. Setup\nSet the bench to 30-45 degrees. Sit with dumbbells on your thighs, then lie back while kicking them up to chest level.\n2. Starting Position\nDumbbells at upper chest height, palms forward, shoulder blades retracted.\n3. Press\nPress both dumbbells upward toward the ceiling, bringing them slightly inward at the top.\n4. Top Position\nDumbbells close together at the top. Squeeze your upper chest briefly.\n5. Lower\nSlowly lower the dumbbells back to upper chest level, feeling the stretch in the upper pecs.\n\nKey points:\n- The incline angle targets the upper chest more than flat pressing.\n- Keep shoulder blades pinched back to protect the shoulder joint.\n- Use a controlled tempo — especially during the lowering phase.',
  },
  [normalizeExerciseName('Decline Bench Press')]: {
    muscles: 'Lower chest, triceps',
    technique:
      '1. Setup\nSet the bench to a decline (15-30 degrees). Secure your legs under the pads. Lie back and unrack the bar or pick up dumbbells.\n2. Starting Position\nBar or dumbbells above your lower chest with arms extended. Shoulder blades retracted.\n3. Lowering Phase\nLower the weight to your lower chest/sternum area with control.\n4. Press\nPress the weight back up to full arm extension.\n5. Lockout\nFully extend at the top and squeeze your lower chest.\n\nKey points:\n- The decline angle targets the lower chest fibers.\n- Always secure your legs under the pads before starting.\n- Use a spotter if using a barbell, as re-racking on a decline can be awkward.',
  },
  [normalizeExerciseName('Decline Barbell Bench Press')]: {
    muscles: 'Lower chest, triceps, anterior delts',
    technique:
      '1. Setup\nLie on a decline bench and secure your legs. Grip the bar slightly wider than shoulder-width.\n2. Starting Position\nUnrack the bar and hold it above your chest with arms fully extended. Core engaged.\n3. Movement\nLower the bar slowly toward your lower chest by bending your elbows.\n4. Bottom Position\nBar touches or comes close to the lower chest. Elbows at about a 45° angle.\n5. Return\nPress the bar back up to the starting position.\n6. Breathing\nExhale as you press, inhale as you lower.\n\nKey points:\n- Emphasis shifts to the lower chest.\n- Do not flare your elbows too wide.\n- Stay controlled and avoid bouncing the bar off the chest.\n- Use full range of motion with proper form.',
  },
  [normalizeExerciseName('Decline Dumbbell Bench Press')]: {
    muscles: 'Lower chest, triceps, anterior delts',
    technique:
      '1. Setup\nLie on a decline bench and secure your legs. Hold dumbbells at chest level.\n2. Starting Position\nElbows bent, dumbbells positioned at the sides of your chest. Core engaged.\n3. Movement\nPress the dumbbells upward in an arc, bringing them over your chest.\n4. Top Position\nDumbbells above your chest, arms nearly extended. Slightly bring them together and squeeze your chest.\n5. Return\nSlowly lower the dumbbells back down with control.\n6. Breathing\nExhale as you press, inhale as you lower.\n\nKey points:\n- Dumbbells allow greater range of motion and stretch.\n- Move in an arc, not straight up and down.\n- Do not lower too deep if you lose control.\n- Maintain stability throughout.',
  },
  [normalizeExerciseName('Chest Press Machine')]: {
    muscles: 'Chest, triceps, anterior delts',
    technique:
      '1. Setup\nAdjust the seat so the handles are at mid-chest height. Sit with your back firmly against the pad.\n2. Starting Position\nGrip the handles with palms forward. Retract your shoulder blades and press your back into the pad.\n3. Press\nPush the handles forward until your arms are almost fully extended.\n4. Top Position\nSqueeze your chest at full extension for 1 second. Do not lock your elbows aggressively.\n5. Return\nSlowly return the handles to the starting position, feeling the stretch.\n\nKey points:\n- The machine is great for beginners and for burnout sets at the end of a chest workout.\n- Keep your shoulder blades retracted throughout.\n- Adjust seat height so the handles align with mid-chest, not shoulders.',
  },
  [normalizeExerciseName('Incline Chest Press Machine')]: {
    muscles: 'Upper chest, anterior delts, triceps',
    technique:
      '1. Setup\nAdjust the seat on the incline chest press machine so handles align with your upper chest. Sit with back against the pad.\n2. Starting Position\nGrip the handles, shoulder blades retracted, feet flat on the floor.\n3. Press\nPush the handles forward and slightly upward until arms are almost fully extended.\n4. Top Position\nSqueeze your upper chest at the top for 1 second.\n5. Return\nSlowly return handles to the starting position under control.\n\nKey points:\n- The incline angle targets upper chest fibers same as a free-weight incline press.\n- The machine stabilizes the path, allowing you to focus purely on pressing.\n- Great as a finisher after free-weight pressing work.',
  },
  [normalizeExerciseName('Cable Chest Fly (Flat)')]: {
    muscles: 'Chest (mid pecs)',
    technique:
      '1. Setup\nSet both cable pulleys at shoulder height. Stand centered between them. Grip a handle in each hand.\n2. Starting Position\nStep forward slightly, lean forward with a slight bend. Arms spread wide with elbows slightly bent.\n3. Fly\nBring both hands together in front of your chest in a wide hugging arc. Keep the elbow angle fixed.\n4. Peak Contraction\nSqueeze your chest hard when hands meet in front of you. Hold for 1 second.\n5. Return\nSlowly spread your arms back to the starting position, feeling the chest stretch.\n\nKey points:\n- Think of hugging a large tree — the movement is an arc, not a press.\n- Keep a slight bend in the elbows throughout; do not straighten or bend further during the movement.\n- Cables provide constant tension, making this superior to dumbbell flies for continuous chest activation.',
  },
  [normalizeExerciseName('Incline Cable Fly')]: {
    muscles: 'Upper chest',
    technique:
      '1. Setup\nSet both cable pulleys at the lowest position. Stand between them or sit on an incline bench between them.\n2. Starting Position\nGrip the handles with arms spread low and wide, slight elbow bend.\n3. Fly\nBring the handles upward and together in front of your upper chest in a wide arc.\n4. Peak Contraction\nSqueeze your upper chest at the top where hands meet. Hold for 1 second.\n5. Return\nSlowly lower the handles back down and outward to the starting position.\n\nKey points:\n- Low cable position + upward arc = upper chest emphasis.\n- Keep elbow angle fixed throughout the movement.\n- Use lighter weight than flat cable flies; the angle makes this more challenging.',
  },
  [normalizeExerciseName('Decline Cable Fly')]: {
    muscles: 'Lower chest',
    technique:
      '1. Setup\nSet both cable pulleys at the highest position. Stand centered between them.\n2. Starting Position\nGrip the handles with arms spread high and wide, slight elbow bend. Lean slightly forward.\n3. Fly\nBring the handles downward and together in front of your lower chest/abdomen in a wide arc.\n4. Peak Contraction\nSqueeze your lower chest where hands meet at the bottom. Hold for 1 second.\n5. Return\nSlowly spread the handles back up and outward.\n\nKey points:\n- High cable position + downward arc = lower chest emphasis.\n- Maintain the same elbow bend throughout.\n- Great for building the lower chest line/chest–ab separation.',
  },
  [normalizeExerciseName('Incline Dumbbell Fly')]: {
    muscles: 'Upper chest',
    technique:
      '1. Setup\nSet the bench to 30-45 degrees. Lie back holding dumbbells above your upper chest, palms facing each other.\n2. Starting Position\nSlight elbow bend, shoulder blades retracted, feet flat on the floor.\n3. Open\nLower the dumbbells outward in a wide arc until you feel a stretch in your upper chest.\n4. Stretch\nPause at the bottom when arms are roughly parallel to the floor.\n5. Close\nBring the dumbbells together over your upper chest, squeezing the upper pecs.\n\nKey points:\n- The incline angle shifts emphasis to the upper chest fibers.\n- Maintain constant elbow bend — do not straighten or bend further.\n- Great for building the upper chest when combined with incline pressing.',
  },
  [normalizeExerciseName('Pec Deck Machine')]: {
    muscles: 'Chest (pectorals)',
    technique:
      '1. Setup\nAdjust the seat so the handles are at chest height. Sit with your back against the pad.\n2. Starting Position\nPlace your forearms against the pads (or grip the handles). Elbows at about 90 degrees, chest open.\n3. Close\nBring the pads/handles together in front of your chest by squeezing your pecs.\n4. Peak Contraction\nSqueeze your chest hard when the pads meet. Hold for 1-2 seconds.\n5. Return\nSlowly open the arms back to the starting position, feeling the chest stretch.\n\nKey points:\n- The machine isolates the chest by eliminating stabilizer requirements.\n- Focus on squeezing the chest muscles together, not pushing with the arms.\n- Great for beginners and as a finisher after pressing movements.',
  },
  [normalizeExerciseName('Push-Ups')]: {
    muscles: 'Chest, triceps, anterior delts, core',
    technique:
      '1. Setup\nPlace your hands slightly wider than shoulder-width on the floor. Extend your legs behind you so your body forms a straight line from head to heels.\n2. Starting Position\nArms fully extended, core braced, glutes squeezed. Shoulders directly over your wrists.\n3. Lowering Phase\nBend your elbows to lower your chest toward the floor. Keep elbows at about 45 degrees to your torso.\n4. Bottom Position\nLower until your chest is just above the floor (or touches lightly). Maintain the straight body line.\n5. Press Up\nPush through your palms to extend your arms and return to the starting position.\n\nKey points:\n- Keep your body in one straight line — do not let hips sag or pike up.\n- Elbows at 45 degrees protects the shoulders; do not flare them to 90 degrees.\n- Full range of motion: chest near the floor at the bottom, arms fully extended at the top.',
  },
  [normalizeExerciseName('Knee Push-Ups')]: {
    muscles: 'Chest, triceps, anterior delts, core',
    technique:
      '1. Position\nPlace your palms on the floor slightly wider than shoulder width. Extend your legs back so your body forms a straight line from head to heels.\n2. Starting Position\nArms fully extended, torso stable, glutes engaged. Shoulders are stacked above the wrists.\n3. Movement\nBend your elbows to lower your chest toward the floor. Keep elbows at about a 45 degree angle to your torso.\n4. Bottom Position\nLower until your chest is close to the floor or lightly touches it. Maintain a straight body line.\n5. Return\nPush through your palms and return to the starting position, fully extending your arms.\n6. Breathing\nExhale on the ascent and inhale on the descent.\n\nKey points:\n- Keep your torso stable and avoid hip sagging.\n- Elbows at about 45 degrees help reduce shoulder stress and effectively load the chest.\n- If the exercise is too difficult, start with the knee variation or with hands on an elevated support. 💪',
  },
  [normalizeExerciseName('Incline Push-Ups')]: {
    muscles: 'Lower chest, triceps',
    technique:
      '1. Position\nPlace your palms on an elevated surface (bench, platform, or sturdy chair) slightly wider than shoulder width.\n2. Starting Position\nExtend your legs back so your body forms a straight line from head to heels. Arms fully extended, torso stable.\n3. Movement\nBend your elbows and lower your chest toward the support. Keep elbows at about a 45 degree angle.\n4. Bottom Position\nLower until your chest is almost touching the support.\n5. Return\nPush through your palms and return to the starting position, fully extending your arms.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- The higher the support, the easier the exercise - a good progression toward floor push-ups.\n- Keep a rigid body line and avoid hip sagging or piking.\n- This variation reduces load on the chest and triceps compared to standard push-ups. 💪',
  },
  [normalizeExerciseName('Decline Push-Ups')]: {
    muscles: 'Upper chest, anterior delts, triceps',
    technique:
      '1. Position\nPlace your feet on an elevated surface (bench, platform, or step) and your hands on the floor slightly wider than shoulder width.\n2. Starting Position\nYour body forms a straight or slightly inclined line from head to heels. Arms fully extended, torso stable.\n3. Movement\nBend your elbows and lower your chest toward the floor. Keep elbows at about a 45 degree angle.\n4. Bottom Position\nLower until your chest is almost touching the floor.\n5. Return\nPush through your palms and return to the starting position, fully extending your arms.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- The higher the foot elevation, the more load shifts to the upper chest and shoulders.\n- Keep your torso stable and avoid hip sagging.\n- This variation increases load compared with standard push-ups. 💪',
  },
  [normalizeExerciseName('Dips (Chest Focus)')]: {
    muscles: 'Lower chest, triceps, anterior delts',
    technique:
      '1. Setup\nGrip the parallel bars and lift yourself to a fully extended arm position.\n2. Starting Position\nLean your torso forward (about 30 degrees). Cross your feet behind you.\n3. Lowering Phase\nBend your elbows to lower your body. Keep the forward lean and allow elbows to flare slightly.\n4. Depth\nLower until you feel a good chest stretch, elbows at about 90 degrees or slightly past.\n5. Press Up\nPush yourself back up to full arm extension, maintaining the forward lean.\n\nKey points:\n- Forward lean = chest focus; upright = triceps focus.\n- The wider your grip and the more you lean, the more chest is activated.\n- Be careful with depth if you have shoulder issues — do not go too deep too fast.',
  },
  [normalizeExerciseName('Smith Machine Bench Press')]: {
    muscles: 'Chest, triceps, anterior delts',
    technique:
      '1. Setup\nPosition the bench under the Smith machine bar. Lie flat with the bar directly above your mid-chest. Retract shoulder blades.\n2. Grip\nGrip the bar slightly wider than shoulder-width. Rotate the bar to unlock it.\n3. Lowering Phase\nLower the bar to your mid-chest under control. Keep elbows at about 45 degrees.\n4. Press\nPress the bar up to full arm extension.\n5. Lockout\nLock out at the top and re-rack by rotating the bar hooks back into position.\n\nKey points:\n- The Smith machine provides a fixed bar path, making it safer for solo training.\n- Position the bench so the bar naturally touches your mid-chest, not neck or stomach.\n- Great for learning the press pattern and for heavy training without a spotter.',
  },
  [normalizeExerciseName('Pull-Ups (Door Bar / Playground Bar)')]: {
    muscles: 'Lats, upper back, biceps, core',
    technique:
      '1. Setup\nHang from a bar with a pronated (overhand) grip, slightly wider than shoulder-width. Arms fully extended.\n2. Starting Position\nEngage your shoulders by pulling them down and back (active hang). Core braced.\n3. Pull\nPull yourself upward by driving your elbows down and back. Focus on using your lats.\n4. Top Position\nPull until your chin clears the bar. Squeeze your lats and upper back briefly.\n5. Lower\nSlowly lower yourself back to a full hang under complete control.\n\nKey points:\n- Start from a dead hang with active shoulders — do not begin with shrugged or relaxed shoulders.\n- Pull with your lats, not just your biceps — think about driving elbows into your back pockets.\n- If you cannot do full reps, use bands or negatives (slow lowering only) to build strength.',
  },
  [normalizeExerciseName('Chin-Ups')]: {
    muscles: 'Lats, biceps, upper back',
    technique:
      '1. Setup\nHang from a bar with a supinated (underhand) grip, about shoulder-width apart. Arms fully extended.\n2. Starting Position\nEngage your shoulders (active hang). Core braced, body straight.\n3. Pull\nPull yourself upward by flexing at the elbows and driving them down. The underhand grip activates biceps more.\n4. Top Position\nPull until your chin clears the bar. Squeeze biceps and lats at the top.\n5. Lower\nSlowly lower yourself back to a full hang.\n\nKey points:\n- Chin-ups emphasize the biceps more than pull-ups due to the underhand grip.\n- Maintain an active hang; do not let your shoulders shrug up to your ears.\n- Great alternative if pull-ups are too difficult — the bicep assistance makes these slightly easier.',
  },
  [normalizeExerciseName('Inverted Rows')]: {
    muscles: 'Upper back, lats, rear delts, biceps',
    technique:
      '1. Setup\nSet a bar at waist height (Smith machine, squat rack, or sturdy table). Lie underneath and grab it with an overhand grip, slightly wider than shoulders.\n2. Body Position\nKeep your body in a straight line from head to heels, core braced, and glutes squeezed. Walk your feet forward to increase difficulty.\n3. Pull\nPull your chest toward the bar by driving your elbows back. Squeeze your shoulder blades together at the top.\n4. Top Position\nHold briefly with your chest close to the bar, shoulder blades fully pinched.\n5. Lower\nSlowly extend your arms to return to the hanging position with full control.\n\nKey points:\n- The closer your feet are to directly under the bar, the harder the exercise.\n- Keep your body rigid — no sagging hips or piking upward.\n- Great pulling exercise for those who cannot yet do full pull-ups.',
  },
  [normalizeExerciseName('Resistance Band Rows')]: {
    muscles: 'Mid-back, lats, rear delts',
    technique:
      '1. Position\nSit on the floor with legs extended forward (or stand). Anchor the band at torso level or around your feet.\n2. Starting Position\nGrab the band ends with arms extended forward and light tension. Keep your back flat and chest open.\n3. Movement\nPull the band toward your lower ribs, driving elbows backward. Squeeze your shoulder blades together.\n4. Top Position\nHold for 1 second while keeping your shoulder blades fully retracted.\n5. Return\nSlowly extend your arms back to the starting position while maintaining band tension.\n6. Breathing\nExhale during the pull and inhale during the return.\n\nKey points:\n- Keep your back flat and avoid rounding.\n- The primary work should come from back muscles, not only the arms.\n- To increase load, use a stiffer band or shorten its working length. 💪',
  },
  [normalizeExerciseName('Band Lat Pulldown')]: {
    muscles: 'Lats, upper back, biceps',
    technique:
      '1. Setup\nAnchor the band at a high point (door anchor, pull-up bar, or high hook). Kneel or sit below it.\n2. Starting Position\nGrip the band with both hands, arms extended upward. Slight lean back, chest up.\n3. Pull\nPull the band down toward your upper chest by driving your elbows down and back.\n4. Peak Contraction\nSqueeze your lats when the band reaches chest level. Hold for 1 second.\n5. Return\nSlowly let your arms extend back to the overhead position.\n\nKey points:\n- Replicate the motion of a cable lat pulldown at home.\n- Focus on pulling with your lats, not your biceps.\n- Use a thicker band or double up for more resistance.',
  },
  [normalizeExerciseName('Single-Arm Dumbbell/Bottle Row')]: {
    muscles: 'Lats, mid-back, rear delts',
    technique:
      '1. Setup\nPlace one hand and knee on a chair or bench for support. Hold a dumbbell (or heavy bottle) in the other hand.\n2. Starting Position\nArm hanging straight down, back flat and parallel to the floor. Core engaged.\n3. Row\nPull the weight upward toward your hip by driving your elbow back past your torso.\n4. Top Position\nSqueeze your lat at the top for 1 second. Elbow should be above your back.\n5. Lower\nSlowly lower the weight to full arm extension. Complete all reps, then switch sides.\n\nKey points:\n- Keep your back flat and parallel to the floor — do not rotate your torso.\n- Pull toward your hip, not your shoulder, for better lat engagement.\n- Use whatever heavy object you have: dumbbell, water bottle, loaded backpack.',
  },
  [normalizeExerciseName('stend Dumbbell/Bottle Row')]: {
    muscles: 'Lats, mid-back, rear delts, biceps',
    technique:
      '1. Position\nStand with feet hip-width apart, holding one dumbbell or bottle in each hand. Hinge forward about 30-45 degrees while keeping your back flat.\n2. Starting Position\nTorso stable, chest open, arms hanging down under the shoulders. Knees slightly bent.\n3. Movement\nRow the load toward your lower ribs by driving elbows back. Keep elbows close to your torso.\n4. Top Position\nPause for 1 second while squeezing your shoulder blades together.\n5. Return\nSlowly lower the load to full arm extension without rounding your back.\n6. Breathing\nExhale during the row and inhale during the lowering phase.\n\nKey points:\n- Keep a neutral spine and avoid rounding the lower back.\n- Pull elbows back toward the hips, not upward toward the neck.\n- Control the lowering phase to maintain tension in back muscles. 💪',
  },
  [normalizeExerciseName('Renegade Row')]: {
    muscles: 'Back, core, shoulders',
    technique:
      '1. Setup\nGet into a push-up position with a dumbbell (or heavy object) in each hand, shoulder-width apart.\n2. Starting Position\nBody in a straight line, core braced, feet slightly wider than normal for stability.\n3. Row\nRow one dumbbell upward by driving the elbow back past your torso. Keep hips level.\n4. Return and Alternate\nSlowly lower the weight, then row the opposite side.\n5. Maintain Stability\nKeep your hips and shoulders square to the floor throughout.\n\nKey points:\n- The wider your feet, the more stable you will be — narrow feet is an advanced variation.\n- Anti-rotation is a key benefit: your core works hard to prevent twisting.\n- Use lighter weight than standard rows — the instability makes this much harder.',
  },
  [normalizeExerciseName('Superman')]: {
    muscles: 'Lower back, glutes, posterior chain',
    technique:
      '1. Setup\nLie face down on the floor with arms extended overhead and legs straight behind you.\n2. Lift\nSimultaneously raise your arms, chest, and legs off the floor by contracting your lower back and glutes.\n3. Hold\nBriefly hold the top position, squeezing your glutes and lower back.\n4. Lower\nSlowly return to the floor with control.\n5. Repeat\nPerform each rep with a distinct lift-and-lower — no bouncing off the floor.\n\nKey points:\n- Keep your neck in line with your spine — look at the floor, not forward.\n- Squeeze your glutes at the top for full posterior chain engagement.\n- Great exercise for building lower back endurance and posture strength.',
  },
  [normalizeExerciseName('Band Pull-Aparts')]: {
    muscles: 'Upper back, rear delts, rotator cuff',
    technique:
      'Technique\n1. Position\nStand upright, holding the band in front of you at shoulder level with both hands.\n\n2. Starting Position\nArms are extended forward with light band tension. Hands are about shoulder-width apart.\n\n3. Movement\nMove your arms outward to stretch the band while squeezing your shoulder blades together.\n\n4. Top Position\nThe band touches or almost touches your chest. Keep shoulder blades retracted and hold for 1 second.\n\n5. Return\nSlowly return to the starting position while maintaining control.\n\n6. Breathing\nExhale during the pull-apart and inhale on the return.\n\nKey points\nKeep arms at shoulder level and almost straight throughout the movement\nFocus on scapular retraction, not on pulling with the arms\nGreat for warm-up and shoulder health; can be performed regularly 💪',
  },
  [normalizeExerciseName('door/bodyweight row')]: {
    muscles: 'Back, lats, biceps',
    technique:
      'Technique\n1. Setup\nStand facing a doorway and grab both sides of the frame at about chest height.\n\n2. Starting Position\nLean your body back with arms extended. Keep your body in a straight line from head to heels.\n\n3. Pull\nPull your body toward the door frame by driving your elbows back. Keep your chest lifted.\n\n4. Top Position\nBring your chest close to the frame. Squeeze your shoulder blades together and hold for 1 second.\n\n5. Return\nSlowly extend your arms and lean back to the starting position.\n\n6. Breathing\nExhale as you pull, inhale as you return.\n\nKey points\nKeep your body straight and do not bend at the hips\nPull with your back, not just your arms\nThe more you lean back, the harder the exercise\nKeep shoulders down and away from your ears',
  },
  [normalizeExerciseName('Push-Ups')]: {
    muscles: 'Chest, triceps, shoulders',
    technique:
      '1. Setup\nPlace your hands slightly wider than shoulder-width on the floor. Extend your legs behind you so your body forms a straight line from head to heels.\n2. Starting Position\nArms fully extended, core braced, glutes squeezed. Shoulders directly over your wrists.\n3. Lowering Phase\nBend your elbows to lower your chest toward the floor. Keep elbows at about 45 degrees to your torso.\n4. Bottom Position\nLower until your chest is just above the floor (or touches lightly). Maintain the straight body line.\n5. Press Up\nPush through your palms to return to the starting position. Fully extend your arms.\n\nKey points:\n- Keep your core tight to prevent hip sag — the most common form error.\n- Elbows at 45 degrees protects the shoulders while maximizing chest activation.\n- If full push-ups are too hard, start from your knees or with hands on an elevated surface.',
  },
  [normalizeExerciseName('Incline Push-Ups')]: {
    muscles: 'Lower chest, triceps, shoulders',
    technique:
      '1. Position\nPlace your palms on an elevated surface (bench, platform, or sturdy chair) slightly wider than shoulder width.\n2. Starting Position\nExtend your legs back so your body forms a straight line from head to heels. Arms fully extended, torso stable.\n3. Movement\nBend your elbows and lower your chest toward the support. Keep elbows at about a 45 degree angle.\n4. Bottom Position\nLower until your chest is almost touching the support.\n5. Return\nPush through your palms and return to the starting position, fully extending your arms.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- The higher the support, the easier the exercise - a good progression toward floor push-ups.\n- Keep a rigid body line and avoid hip sagging or piking.\n- This variation reduces load on the chest and triceps compared to standard push-ups. 💪',
  },
  [normalizeExerciseName('Decline Push-Ups')]: {
    muscles: 'Upper chest, triceps, shoulders',
    technique:
      '1. Position\nPlace your feet on an elevated surface (bench, platform, or step) and your hands on the floor slightly wider than shoulder width.\n2. Starting Position\nYour body forms a straight or slightly inclined line from head to heels. Arms fully extended, torso stable.\n3. Movement\nBend your elbows and lower your chest toward the floor. Keep elbows at about a 45 degree angle.\n4. Bottom Position\nLower until your chest is almost touching the floor.\n5. Return\nPush through your palms and return to the starting position, fully extending your arms.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- The higher the foot elevation, the more load shifts to the upper chest and shoulders.\n- Keep your torso stable and avoid hip sagging.\n- This variation increases load compared with standard push-ups. 💪',
  },
  [normalizeExerciseName('Wide Push-Ups')]: {
    muscles: 'Chest (outer emphasis), triceps',
    technique:
      '1. Setup\nPlace your hands about 1.5x shoulder-width apart on the floor. Extend legs behind you.\n2. Starting Position\nBody in a straight line, core braced, arms extended.\n3. Lowering Phase\nBend elbows to lower your chest toward the floor. Elbows flare out more than standard push-ups.\n4. Bottom Position\nLower until your chest nearly touches the floor.\n5. Press Up\nPush through your palms to return to the starting position.\n\nKey points:\n- The wider hand placement increases chest stretch and activation.\n- Wider stance reduces triceps involvement compared to narrow push-ups.\n- Keep your core tight to prevent hip sagging — the wider base makes this tempting.',
  },
  [normalizeExerciseName('Diamond Push-Ups')]: {
    muscles: 'Triceps, inner chest',
    technique:
      '1. Position\nPlace your hands close together, joining your thumbs and index fingers to form a diamond shape.\n2. Starting Position\nExtend your legs back so your body forms a straight line from head to heels. Core stable, arms fully extended.\n3. Movement\nBend your elbows and lower your chest toward your hands. Keep elbows close to your torso.\n4. Bottom Position\nLower until your chest is almost touching your hands.\n5. Return\nPush through your palms and fully extend your arms to return to the start. Primary load is on the triceps.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- A narrow hand position maximizes triceps loading.\n- Elbows should track close to the torso - flaring them reduces triceps emphasis.\n- If the exercise is too difficult, slightly widen your hand placement while keeping it narrower than shoulder width. 💪',
  },
  [normalizeExerciseName('Bottle Floor Press')]: {
    muscles: 'Chest, triceps',
    technique:
      '1. Position\nLie on the floor, holding one bottle (or dumbbell) in each hand. Knees bent, feet flat on the floor.\n2. Starting Position\nHands at chest level, elbows touching the floor, wrists stacked above elbows.\n3. Movement\nPress the load upward until your arms are fully extended.\n4. Top Position\nAt the top, additionally contract your chest by slightly bringing your hands toward each other.\n5. Return\nSlowly lower the load until your elbows softly touch the floor. Pause briefly and repeat the movement.\n6. Breathing\nExhale during the press and inhale during the lowering phase.\n\nKey points:\n- The floor limits range of motion and reduces stress on the shoulder joints.\n- Keep wrists in a neutral position and avoid excessive backward bending.\n- Excellent home chest-press option when no bench is available. 💪',
  },
  [normalizeExerciseName('Resistance Band Chest Press')]: {
    muscles: 'Chest, triceps, anterior delts',
    technique:
      '1. Position\nPlace the resistance band behind your back at chest level and hold both ends in your hands.\n2. Starting Position\nStand in a split stance or sit upright. Hands at chest level, elbows bent, and the band under tension.\n3. Movement\nPress your arms forward, keeping the motion at chest level, until full extension.\n4. Top Position\nAt full extension, additionally squeeze your chest muscles and hold for 1 second.\n5. Return\nSlowly bend your arms and return to the starting position.\n6. Breathing\nExhale during the press and inhale during the return.\n\nKey points:\n- Band resistance increases as your arms extend, so peak load is at the end range.\n- Keep your torso stable and avoid arching your lower back.\n- To increase load, use a thicker band or fold it in half. 💪',
  },
  [normalizeExerciseName('Resistance Band Chest Fly')]: {
    muscles: 'Chest',
    technique:
      '1. Setup\nLoop the band around your back at chest level. Hold the ends in each hand.\n2. Starting Position\nArms spread wide at shoulder height, slight bend in elbows, tension on the band.\n3. Fly\nBring both hands together in front of your chest in a wide hugging arc.\n4. Peak Contraction\nSqueeze your chest hard when hands meet. Hold for 1 second.\n5. Return\nSlowly spread your arms back to the starting position.\n\nKey points:\n- Keep the same elbow bend throughout — do not straighten or bend further.\n- The band gives increasing resistance as you close, maximizing peak contraction.\n- Move slowly and focus on chest activation, not arm strength.',
  },
  [normalizeExerciseName('Bodyweight Squat')]: {
    muscles: 'Quads, glutes, hamstrings',
    technique:
      '1. Position\nStand with feet shoulder-width apart and toes slightly turned outward. Arms can be in front, crossed on your chest, or behind your head.\n2. Starting Position\nChest open, torso stable, and weight evenly distributed across your feet.\n3. Movement\nSend your hips back and begin bending your knees to lower down. Keep your chest open and knees tracking in line with your toes.\n4. Bottom Position\nLower to thigh-parallel or below, within your mobility range. Do not allow knees to collapse inward.\n5. Return\nDrive through your heels and midfoot to return to standing. At the top, add an extra glute squeeze.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- Keep your heels on the floor for the entire movement; if they lift, work on ankle mobility.\n- Knees should point in the same direction as your toes.\n- Keep your torso upright and avoid rounding your back.',
  },
  [normalizeExerciseName('Jump Squat')]: {
    muscles: 'Quads, glutes, calves',
    technique:
      '1. Setup\nStand with feet shoulder-width apart, arms at your sides or in front of you.\n2. Descent\nPush hips back and lower into a squat position (thighs approximately parallel).\n3. Jump\nExplode upward from the bottom by pushing through your feet. Swing arms upward for momentum.\n4. Landing\nLand softly on the balls of your feet, immediately transitioning into the next squat.\n5. Repeat\nContinue with a smooth squat-jump-squat rhythm.\n\nKey points:\n- Land softly with bent knees — do not land with locked legs.\n- Focus on quiet landings — loud landings mean poor shock absorption.\n- Explosive power should come from the legs, not from momentum or arm swinging.',
  },
  [normalizeExerciseName('Wall Sit')]: {
    muscles: 'Quads, glutes',
    technique:
      '1. Setup\nStand with your back against a wall. Walk your feet forward about 2 feet from the wall.\n2. Slide Down\nSlide your back down the wall until your thighs are parallel to the floor and knees are at 90 degrees.\n3. Hold Position\nHold this seated position with your back flat against the wall. Place arms at your sides or on thighs.\n4. Maintain Form\nKeep your weight in your heels, not your toes. Do not let knees go past your toes.\n5. Stand Up\nWhen finished, push through your heels and slide up the wall to standing.\n\nKey points:\n- Keep your back flat against the wall — do not arch or round.\n- Thighs exactly parallel to the floor for maximum quad activation.\n- Breathe steadily throughout — do not hold your breath.',
  },
  [normalizeExerciseName('Step-Ups')]: {
    muscles: 'Glutes, quads',
    technique:
      '1. Position\nStand in front of a stable bench, platform, or step. Feet hip-width apart, torso stable.\n2. Starting Position\nPlace one foot fully on the platform. The entire foot is supported, not just the toes.\n3. Movement\nDrive through the heel of the lead leg and lift your body up. Do not assist with the trailing leg — the front leg does the primary work.\n4. Top Position\nStep up onto the platform and place the second foot next to it. Keep your torso upright and hips level.\n5. Return\nStep down one leg at a time while maintaining control and balance.\n6. Breathing\nExhale during the ascent and inhale during the descent.\n\nKey points:\n- Drive through the heel of the working leg for maximum glute activation.\n- Keep your torso upright and avoid leaning forward.\n- A higher platform increases the range of motion and glute loading.',
  },
  [normalizeExerciseName('Bulgarian Split Squat')]: {
    muscles: 'Glutes, quads, hamstrings',
    technique:
      '1. Position\nStand about 60 cm in front of a chair or bench. Place the top of your rear foot on the support behind you.\n2. Starting Position\nFront foot fully planted, torso straight, core active. Hands on hips or holding weight.\n3. Descent\nBend the front leg and lower the rear knee toward the floor. Keep the front shin close to vertical.\n4. Bottom Position\nLower until the front thigh is parallel to the floor. Rear knee should be just above the floor.\n5. Ascent\nDrive up through the front heel and return to the starting position. Keep your torso straight throughout the movement.\n\nKey points:\n- Keep most of your weight on the front leg; the rear leg is for balance.\n- Keep the front shin as vertical as possible; the knee should not travel far forward past the toes.\n- Excellent exercise for building single-leg strength and balance.',
  },
  [normalizeExerciseName('Bulgarian Split Squat (Gym)')]: {
    muscles: 'Glutes, quads, adductors',
    technique:
      '1. Setup\nStand about one step in front of a bench in the gym. Place the laces of the rear foot on the bench. Hold dumbbells at your sides.\n2. Starting Position\nFront foot fully planted, ribcage down, core braced. Keep hips square and shoulders stacked over pelvis.\n3. Descent\nLower in a straight vertical path by bending the front knee and hip together. Rear knee moves toward the floor under control.\n4. Bottom Position\nStop when the front thigh is near parallel and you still keep full foot pressure on the front leg.\n5. Ascent\nDrive through the whole front foot (heel + midfoot) and return up without bouncing.\n6. Breathing\nInhale on the way down, exhale through the hardest part of the ascent.\n\nKey points:\n- In gym execution, prioritize load control and stable pelvis over depth.\n- Keep a neutral spine and avoid pushing off the rear leg.\n- Start with lighter dumbbells, then progress load only if both sides stay technically equal.',
  },
  [normalizeExerciseName('Reverse Lunges')]: {
    muscles: 'Glutes, quads, hamstrings',
    technique:
      '1. Position\nStand upright, feet hip-width apart, torso stable. Hands on hips or by your sides.\n2. Step Back\nTake one leg back about 60-90 cm and begin lowering by bending both legs.\n3. Bottom Position\nLower to about 90 degrees in both knees. Rear knee stays just above the floor. Front shin remains vertical.\n4. Return\nPush through the heel of the front foot and return to the starting position, bringing the rear leg forward.\n5. Switch Legs\nRepeat with the other leg.\n\nKey points:\n- Reverse lunges are gentler on the knees compared to forward lunges and are preferable if you have knee discomfort.\n- Push through the heel of the front foot, not the toes.\n- Keep your torso upright and avoid leaning forward.',
  },
  [normalizeExerciseName('Forward Lunges')]: {
    muscles: 'Quads, glutes',
    technique:
      '1. Position\nStand upright, feet hip-width apart, core stable.\n2. Step Forward\nTake a wide step forward with one leg and begin to lower down.\n3. Bottom Position\nBend both legs to about 90 degrees. Keep the front shin nearly vertical. Rear knee should be just above the floor.\n4. Return\nPush through the front leg and return to the starting position.\n5. Switch Legs\nRepeat on the other side.\n\nKey points:\n- Forward lunges place more load on the quadriceps and require greater deceleration control compared with reverse lunges.\n- Keep the torso upright and maintain core stability throughout the movement.\n- Take a wide enough step so the front knee does not travel far forward past the toes.',
  },
  [normalizeExerciseName('Walking Lunges')]: {
    muscles: 'Quads, glutes, hamstrings',
    technique:
      '1. Position\nStand upright at the start of your space. Feet hip-width apart, torso stable. Hands on hips or by your sides.\n2. Starting Position\nKeep your torso upright and prepare for the step forward.\n3. Movement\nStep forward and lower into a lunge, bending both legs to about 90 degrees. Then drive through the front heel and bring the rear leg forward into the next step.\n4. Bottom Position\nOn each step, the rear knee lowers close to the floor while the front shin stays close to vertical.\n5. Return\nContinue moving forward with alternating legs while maintaining control and balance.\n6. Breathing\nExhale on the ascent and inhale on the descent.\n\nKey points:\n- Walking lunges develop coordination, balance, and endurance.\n- Keep step length consistent: too short overloads the knees, too long makes the ascent harder.\n- Move at a steady, controlled pace without rushing.',
  },
  [normalizeExerciseName('Sumo Squat')]: {
    muscles: 'Glutes, inner thighs (adductors), quads',
    technique:
      '1. Position\nTake a wide stance (about 1.5-2x shoulder width), with toes turned out about 45 degrees.\n2. Starting Position\nChest open, torso stable. Hands in front of you or on your hips.\n3. Movement\nSend your hips back and down while bending your knees and directing them in line with your toes.\n4. Bottom Position\nLower until your thighs are parallel to the floor. Aim to keep your torso as upright as possible.\n5. Return\nDrive through your heels to return to the starting position. At the top, add an extra glute squeeze.\n6. Breathing\nExhale on the ascent and inhale on the descent.\n\nKey points:\n- Keep knees pushed outward and tracking along the line of your toes.\n- A wide stance increases load on the inner thighs and glutes.\n- Keep your torso upright and avoid leaning forward.',
  },
  [normalizeExerciseName('Glute Bridge')]: {
    muscles: 'Glutes, hamstrings',
    technique:
      'Muscles involved\n\nGlutes, hamstrings\n\nTechnique\n1. Position\n\nLie on your back, bend your knees, and place your feet on the floor hip-width apart, close to your glutes.\n\n2. Starting Position\n\nArms along your sides, palms facing down. Core stable.\n\n3. Ascent\n\nDrive through your heels and raise your hips upward. At the top, your body should form a straight line from shoulders to knees.\n\n4. Top Position\n\nSqueeze your glutes hard and hold for 2 seconds. Do not allow hyperextension in the lower back.\n\n5. Descent\n\nSlowly lower your hips back to the floor.\n\nKey points\nPush through your heels, not your toes — this increases glute involvement\nSqueeze your glutes maximally at the top\nDo not arch your lower back — keep a straight line from shoulders to knees',
  },
  [normalizeExerciseName('Single-Leg Glute Bridge')]: {
    muscles: 'Glutes, hamstrings',
    technique:
      'Technique\n1. Position\nLie on your back, bend your knees, and place your feet on the floor. Extend one leg and raise it upward.\n\n2. Starting Position\nOne foot stays on the floor close to the glutes. Torso remains stable.\n\n3. Movement\nDrive through the heel of the supporting leg and lift your hips up. The extended leg remains raised.\n\n4. Top Position\nKeep the pelvis level without tilt. Squeeze the glutes hard and hold for 2 seconds.\n\n5. Return\nSlowly lower your hips back down. Complete all reps, then switch legs.\n\n6. Breathing\nExhale during the lift and inhale during the descent.\n\nKey points\nKeep the pelvis level and do not let one side drop\nThis exercise helps correct left-right strength imbalances\nIf keeping hips level is difficult, start with the standard glute bridge 💪',
  },
  [normalizeExerciseName('Hip Thrust (Chair/Sofa)')]: {
    muscles: 'Glutes, hamstrings',
    technique:
      '1. Setup\nSit on the floor with your upper back resting against the edge of a sturdy chair or sofa. Bend your knees with feet flat on the floor.\n2. Starting Position\nPosition your shoulder blades on the edge of the surface. Feet hip-width apart, about shin-length from your glutes.\n3. Thrust\nDrive through your heels to lift your hips until your torso is parallel to the floor.\n4. Top Position\nSqueeze your glutes hard at the top for 2 seconds. Chin slightly tucked.\n5. Lower\nSlowly lower your hips back toward the floor.\n\nKey points:\n- The hip thrust is the best glute exercise — prioritize proper glute squeeze at the top.\n- Keep your chin slightly tucked to maintain posterior pelvic tilt and maximize glute engagement.\n- Add weight (backpack, heavy book) on your hips to increase difficulty.',
  },
  [normalizeExerciseName('Donkey Kicks')]: {
    muscles: 'Glutes',
    technique:
      'Technique\n1. Position\nGet into an all-fours position: hands under shoulders, knees under hips.\n\n2. Starting Position\nCore is stable, spine in a neutral position. One leg remains the support leg, the other is the working leg.\n\n3. Movement\nKeeping about a 90° knee angle, lift the working leg upward by moving at the hip joint. Foot points upward.\n\n4. Top Position\nAt the top, squeeze the glutes and hold for 1-2 seconds. Pelvis stays level without rotation.\n\n5. Return\nSlowly lower the leg back down without touching the floor. Complete all reps, then switch sides.\n\n6. Breathing\nExhale on the lift, inhale on the way down.\n\nKey points\nKeep a neutral spine and avoid arching the lower back\nSqueeze the glutes hard at the top position\nKeep the pelvis stable and do not rotate it to the side 💪',
  },
  [normalizeExerciseName('Fire Hydrants')]: {
    muscles: 'Glute medius, hip abductors',
    technique:
      'Technique\n1. Position\nGet into an all-fours position: hands under shoulders, knees under hips.\n\n2. Starting Position\nCore is stable, spine in a neutral position. The working leg is bent, with the knee on the floor.\n\n3. Movement\nKeeping about a 90° knee angle, move the leg out to the side, lifting it upward.\n\n4. Top Position\nLift the knee to hip level. Squeeze the glutes and hold for 1-2 seconds.\n\n5. Return\nSlowly lower the knee back to the floor. Complete all reps, then switch sides.\n\n6. Breathing\nExhale on the lift, inhale on the way down.\n\nKey points\nKeep the torso stable and do not shift weight to the opposite side\nThe main load is on the glute medius, which is important for pelvic stability\nTo increase difficulty, use ankle weights or a band above the knees 💪',
  },
  [normalizeExerciseName('Side-Lying Leg Raises')]: {
    muscles: 'Glute medius, hip abductors',
    technique:
      'Technique\n1. Position\nLie on your side with legs straight and stacked one on top of the other. Rest your head on your arm or hand.\n\n2. Starting Position\nYour body forms a straight line. Keep the torso stable.\n\n3. Movement\nLift the top leg upward while keeping it straight. Initiate the movement through the heel.\n\n4. Top Position\nRaise the leg to about 45° or until you feel the glutes working. Hold for 1 second.\n\n5. Return\nSlowly lower the leg back to the starting position. Complete all reps, then switch sides.\n\n6. Breathing\nExhale on the lift and inhale on the descent.\n\nKey points\nLead with the heel, not the toes, to increase glute activation\nKeep the pelvis level and avoid rolling backward\nDo not lift the leg too high; controlled movement in the working range is key 💪',
  },
  [normalizeExerciseName('Clamshells')]: {
    muscles: 'Glute medius, external rotators',
    technique:
      'Technique\n1. Position\nLie on your side with knees bent at about 45°. Keep your feet together, with your head resting on your arm.\n\n2. Starting Position\nFeet are pressed together, core lightly stabilized. Keep the pelvis level, without rolling backward or forward.\n\n3. Movement\nLift the top knee upward while keeping the feet together.\n\n4. Top Position\nRaise the knee as high as possible without shifting the pelvis. Squeeze the glutes and hold for 1-2 seconds.\n\n5. Return\nSlowly lower the knee back to the starting position.\n\n6. Breathing\nExhale on the way up, inhale on the way down.\n\nKey points\nFeet stay together throughout the movement; only the knee moves\nDo not roll the pelvis backward while lifting the knee\nFor added difficulty, use a band above the knees 💪',
  },
  [normalizeExerciseName('Single-Leg RDL')]: {
    muscles: 'Hamstrings, glutes, lower back',
    technique:
      '1. Position\nStand on one leg with a slight bend in the knee. You may hold a weight in the opposite hand.\n2. Starting Position\nTorso upright and stable. Maintain balance on the supporting leg.\n3. Movement\nHinge forward at the hips while extending the free leg backward. The torso and free leg move as one line.\n4. Bottom Position\nLower until your torso and free leg are approximately parallel to the floor. Feel the stretch in the hamstrings of the supporting leg.\n5. Return\nDrive your hips forward and return to the starting position, bringing the free leg down.\n6. Breathing\nExhale on the way up and inhale during the hinge.\n\nKey points:\n- Keep your back flat and avoid rounding.\n- The supporting-leg knee remains slightly bent.\n- This exercise develops balance, hamstring flexibility, and glute strength.',
  },
  [normalizeExerciseName('Romanian Deadlift (Bottle/Backpack)')]: {
    muscles: 'Hamstrings, glutes, lower back',
    technique:
      '1. Position\nStand with feet hip-width apart. Hold resistance in front of your thighs - dumbbells, water bottles, or a loaded backpack.\n2. Starting Position\nKnees are slightly bent and remain in that position. Torso stable, back flat.\n3. Movement\nPush your hips back and lower the weight along your legs by hinging at the hips. Keep the load as close to your legs as possible.\n4. Bottom Position\nLower until you feel a pronounced stretch in the hamstrings. Do not round your back.\n5. Return\nDrive your hips forward and return to the starting position. At the top, add an extra glute squeeze.\n6. Breathing\nExhale on the ascent and inhale during the hinge.\n\nKey points:\n- This is a hip-hinge movement, not a squat - the knee angle remains nearly unchanged.\n- Keep the load close to your legs for proper mechanics.\n- Use any available weight: a backpack with books, water bottles, etc. 💪',
  },
  [normalizeExerciseName('Good Morning')]: {
    muscles: 'Hamstrings, glutes, lower back',
    technique:
      '1. Setup\nStand with feet shoulder-width apart. Place the barbell on your upper back (or use a band/bodyweight option).\n2. Starting Position\nCore braced, back neutral, knees slightly bent.\n3. Hinge\nPush your hips back and lean your torso forward by hinging at the hips. Keep your chest open and spine neutral.\n4. Bottom Position\nLower until your torso is close to parallel with the floor or until you feel a controlled hamstring stretch.\n5. Return\nDrive your hips forward and rise back to standing. Squeeze glutes at the top.\n6. Breathing\nInhale on the way down, exhale while returning up.\n\nKey points:\n- Keep the movement in the hips, not in the lower back.\n- Do not round your back or drop your chest.\n- Start with light load and increase only after technique is stable. 💪',
  },
  [normalizeExerciseName('Good Mornings (Bodyweight/Band)')]: {
    muscles: 'Hamstrings, lower back, glutes',
    technique:
      '1. Setup\nStand with feet shoulder-width apart. Place hands behind your head or hold a band across your upper back.\n2. Starting Position\nCore braced, back straight, slight bend in the knees.\n3. Hinge\nPush your hips back and lean your torso forward by hinging at the hips. Keep your back flat.\n4. Bottom Position\nLower until your torso is roughly parallel to the floor (or as far as your hamstrings allow).\n5. Return\nDrive your hips forward to return to standing. Squeeze glutes at the top.\n\nKey points:\n- This is a hip hinge — the movement comes from the hips, not the lower back.\n- Keep your back flat and neutral throughout; any rounding means you went too far.\n- Start with bodyweight only; add a band when the movement feels comfortable.',
  },
  [normalizeExerciseName('Leg Slides (towel leg curls)')]: {
    muscles: 'Hamstrings, glutes',
    technique:
      '1. Setup\nLie on your back with your heels on towels or sliders. Bend your knees slightly and keep your arms by your sides.\n2. Starting Position\nLift your hips into a bridge and brace your core.\n3. Slide Out\nSlowly slide your heels away from your body, extending your legs while keeping your hips as high as possible.\n4. Curl In\nPull your heels back toward your glutes by flexing your knees and squeezing your hamstrings.\n5. Repeat\nPerform each rep under control without letting your hips drop.\n\nKey points:\n- Keep your hips elevated throughout to maintain hamstring tension.\n- Move slowly on the way out and in; avoid momentum.\n- If this is too hard, reduce range of motion first and keep strict control.',
  },
  [normalizeExerciseName('Wall Glute Squeeze (Isometric)')]: {
    muscles: 'Glutes, glute medius, hip abductors',
    technique:
      'Technique\n1. Position\nPlace a mini band just above the knees and stand with your back lightly supported against a wall. Feet hip-width apart, knees slightly bent.\n\n2. Starting Position\nSlightly shift your hips back toward the wall while keeping the torso stable. Maintain tension in the band.\n\n3. Movement\nSqueeze the glutes and move the knees outward against band resistance. Keep the motion small and controlled.\n\n4. Top Position\nAt the widest safe position, hold for 1-2 seconds while maintaining tension in both the glutes and the band.\n\n5. Return\nSlowly bring the knees back in without losing band tension, then repeat.\n\n6. Breathing\nBreathe steadily and do not hold your breath.\n\nKey points\nKeep light pressure into the wall and avoid arching the lower back\nThe movement should come from the hips and glutes, not from turning the feet outward\nMaintain constant band tension throughout the entire exercise 💪',
  },
  [normalizeExerciseName('Band Squats')]: {
    muscles: 'Quads, glutes',
    technique:
      '1. Setup\nPlace a resistance band just above your knees or stand on a long band while holding it in your hands. Keep your feet shoulder-width apart. If needed, add extra weight using dumbbells or a household item (e.g., a water bottle).\n2. Starting Position\nCore braced, chest up.\n3. Descent\nPush your hips back and squat down, actively pushing your knees outward against the band.\n4. Bottom Position\nLower to parallel or just below. Keep knees pressed out against band resist.\n5. Stand Up\nPush through heels to stand, keeping outward pressure on the band throughout.\n\nKey points:\n- The band teaches proper knee tracking by forcing you to push outward.\n- This variation is especially effective for glute activation and helping correct knee valgus when using a short band placed above the knees.\n- Can be used as a warm-up before heavy squatting.',
  },
  [normalizeExerciseName('Band Lateral Walks')]: {
    muscles: 'Glute medius, hip abductors',
    technique:
      'Technique\n1. Position\nPlace the band around your ankles (harder) or slightly above the knees (easier). Feet hip-width apart.\n\n2. Starting Position\nAssume a half-squat position: knees slightly bent, hips pushed back, torso stable.\n\n3. Movement\nTake a controlled step to the side with one leg, stretching the band.\n\n4. Return\nBring the second leg in to return to the starting position while keeping tension in the band.\n\n5. Continue\nKeep moving in one direction for the prescribed reps, then switch sides.\n\n6. Breathing\nBreathe steadily and avoid holding your breath.\n\nKey points\nKeep constant band tension and avoid bringing the feet fully together\nStay in a half-squat; do not stand upright between steps\nFeet point forward; avoid turning them outward 💪',
  },
  [normalizeExerciseName('Biceps Curl (Water Bottles / Dumbbells)')]: {
    muscles: 'Biceps',
    technique:
      '1. Setup\nStand upright holding dumbbells or heavy water bottles at your sides, palms facing forward.\n2. Starting Position\nArms fully extended, elbows close to your body, shoulders relaxed.\n3. Curl\nCurl both weights upward by flexing at the elbows. Keep upper arms stationary.\n4. Top Position\nSqueeze your biceps at the top for 1 second.\n5. Lower\nSlowly lower the weights back to full extension.\n\nKey points:\n- Keep elbows pinned to your sides — do not let them drift forward.\n- Avoid swinging your body to lift the weight.\n- Use whatever you have: dumbbells, water bottles, heavy books, cans.',
  },
  [normalizeExerciseName('Alternating Biceps Curl')]: {
    muscles: 'Biceps',
    technique:
      '1. Setup\nStand upright holding weights at your sides, palms facing inward (neutral grip).\n2. Starting Position\nArms extended, elbows close to your body.\n3. Curl One Arm\nCurl one weight upward, rotating your palm toward your shoulder as you lift. Keep the other arm still.\n4. Lower and Switch\nSlowly lower the working arm, then curl the opposite arm.\n5. Alternate\nContinue alternating sides with controlled reps.\n\nKey points:\n- Complete full range on one arm before starting the other.\n- Keep your torso still — no leaning or swinging.\n- Alternating allows you to focus on each arm individually.',
  },
  [normalizeExerciseName('Hammer Curl')]: {
    muscles: 'Biceps, forearms',
    technique:
      '1. Setup\nStand upright holding dumbbells or heavy bottles at your sides with a neutral grip (palms facing each other).\n2. Starting Position\nArms fully extended, elbows pinned to your sides, core engaged.\n3. Curl\nCurl both weights upward simultaneously while maintaining the neutral grip throughout. Do not rotate your wrists.\n4. Top Position\nSqueeze at the top for 1 second. Your thumbs should point toward your shoulders.\n5. Lower\nSlowly lower the weights to full extension.\n\nKey points:\n- The neutral grip targets the brachioradialis and long head of the biceps more than standard curls.\n- Keep elbows pinned to your sides — do not let them drift forward.\n- Hammer curls build forearm thickness along with biceps size.',
  },
  [normalizeExerciseName('Resistance Band Curl single arm')]: {
    muscles: 'Biceps, brachialis',
    technique:
      '1. Setup\nStand on one end of the band (same side as the working arm) and hold the other end with an underhand grip.\n2. Starting Position\nArm fully extended, elbow close to your torso, light tension on the band. Opposite hand can rest on hip for balance.\n3. Curl\nCurl the band up with one arm while keeping your upper arm still.\n4. Top Position\nSqueeze the biceps for 1 second at the top.\n5. Lower\nLower slowly to full extension and repeat all reps before switching arms.\n\nKey points:\n- Keep elbow pinned to your side and avoid shoulder swing.\n- Control the lowering phase to keep tension on the biceps.\n- Move your foot position to increase or reduce band resistance.',
  },
  [normalizeExerciseName('Concentration Curl')]: {
    muscles: 'Biceps',
    technique:
      'Technique\n1. Position\nSit on a chair or bench with legs apart. Hold a dumbbell, bottle, or any available load in one hand.\n\n2. Starting Position\nBrace the elbow of the working arm against the inner thigh. The arm is fully extended, with the load slightly above the floor.\n\n3. Movement\nCurl the arm to raise the load toward the shoulder. Keep the upper arm pressed into the thigh.\n\n4. Top Position\nSqueeze the biceps hard and hold for 1-2 seconds.\n\n5. Return\nSlowly lower the load to full arm extension. Complete all reps, then switch arms.\n\n6. Breathing\nExhale during the curl and inhale during the lowering phase.\n\nKey points\nAnchoring the elbow against the thigh removes momentum and isolates the biceps\nFocus on maximal contraction at the top position\nExcellent exercise for training each arm separately and correcting imbalances 💪',
  },
  [normalizeExerciseName('Chin-Ups (Biceps Focus)')]: {
    muscles: 'Biceps, lats',
    technique:
      '1. Setup\nGrip a pull-up bar or door bar with an underhand (supinated) grip, about shoulder-width apart.\n2. Starting Position\nHang with arms fully extended, shoulders engaged (active hang). Core braced, body straight.\n3. Pull\nPull yourself upward by flexing at the elbows and driving them downward. The underhand grip activates biceps more than standard pull-ups.\n4. Top Position\nPull until your chin clears the bar. Squeeze your biceps and lats at the top.\n5. Lower\nSlowly lower yourself back to a full hang under complete control.\n\nKey points:\n- Chin-ups emphasize the biceps significantly more than overhand pull-ups.\n- Start from a dead hang on every rep for full range of motion.\n- If full chin-ups are too hard, use a band for assistance or do slow negatives.',
  },
  [normalizeExerciseName('Bench/Chair Dips')]: {
    muscles: 'Triceps, anterior delts',
    technique:
      '1. Setup\nSit on the edge of a sturdy chair, hands gripping the edge beside your hips, fingers forward.\n2. Starting Position\nSlide off the edge with arms supporting you. Extend legs forward (straight = harder, bent = easier).\n3. Lower\nBend your elbows to lower your body. Keep elbows pointing straight back.\n4. Bottom Position\nLower until elbows reach about 90 degrees. Do not go deeper if shoulders feel strained.\n5. Press Up\nPush through your palms to fully extend your arms and return to the top.\n\nKey points:\n- Keep elbows pointing back, not flaring to the sides.\n- Straight legs = harder; bent knees = easier. Choose your difficulty.\n- Do not let your shoulders shrug up toward your ears.',
  },
  [normalizeExerciseName('Close-Grip Push-Ups')]: {
    muscles: 'Triceps, inner chest',
    technique:
      '1. Setup\nPlace your hands close together on the floor (thumbs and index fingers touching to form a diamond, or hands shoulder-width).\n2. Starting Position\nBody in a straight line from head to heels, core braced.\n3. Lowering Phase\nBend elbows to lower your chest toward your hands. Keep elbows tight to your body.\n4. Bottom Position\nLower until your chest nearly touches your hands.\n5. Press Up\nPush through your palms to extend arms. Focus on the triceps doing the work.\n\nKey points:\n- The closer your hands, the more triceps are targeted.\n- Keep elbows close to your body — do not flare them out.\n- If full close-grip is too hard, start with hands shoulder-width (still triceps-dominant).',
  },
  [normalizeExerciseName('Overhead Triceps Extension (Bottle/DB/Band)')]: {
    muscles: 'Triceps (long head emphasis)',
    technique:
      '1. Setup\nStand or sit upright. Hold a heavy bottle, dumbbell, or band behind your head with both hands.\n2. Starting Position\nElbows pointing toward the ceiling, close to your ears. Weight behind your head.\n3. Extension\nExtend your arms overhead by straightening the elbows. Keep upper arms vertical and stationary.\n4. Top Position\nFully extend and squeeze your triceps for 1 second.\n5. Lower\nSlowly lower the weight behind your head by bending the elbows.\n\nKey points:\n- The overhead position stretches the long head of the triceps for maximum activation.\n- Keep elbows pointing forward — do not let them flare out.\n- Use whatever weight you have: water bottle, heavy book, filled backpack.',
  },
  [normalizeExerciseName('Triceps Kickbacks')]: {
    muscles: 'Triceps',
    technique:
      '1. Setup\nLean forward with one hand on a chair for support. Hold a weight in the other hand, upper arm parallel to your torso.\n2. Starting Position\nElbow bent at 90 degrees, upper arm level with your back.\n3. Extension\nExtend your arm backward by straightening the elbow. Keep the upper arm locked in place.\n4. Peak Contraction\nFully extend and squeeze the tricep for 1-2 seconds at the top.\n5. Return\nSlowly bend the elbow back to 90 degrees. Complete all reps, then switch arms.\n\nKey points:\n- Upper arm stays parallel to the floor — only the forearm moves.\n- Squeeze hard at full extension for maximum peak contraction.\n- Use lighter weight with strict form — this is an isolation exercise.',
  },
  [normalizeExerciseName('Band Triceps Pushdown')]: {
    muscles: 'Triceps',
    technique:
      '1. Setup\nAnchor the band at a high point (door hook, pull-up bar). Face the anchor and grab the band ends.\n2. Starting Position\nPull the band down to chest level. Pin your elbows to your sides.\n3. Push Down\nExtend your arms downward by straightening your elbows. Keep upper arms completely still.\n4. Bottom Position\nFully extend and squeeze your triceps for 1 second.\n5. Return\nSlowly let the band pull your hands back to chest level.\n\nKey points:\n- Replicate the motion of a cable pushdown using a band.\n- Keep elbows fixed at your sides; all movement comes from the forearms.\n- Use a thicker band or shorten it for more resistance.',
  },
  [normalizeExerciseName('Diamond Push-Ups')]: {
    muscles: 'Triceps, inner chest',
    technique:
      '1. Position\nPlace your hands close together, joining your thumbs and index fingers to form a diamond shape.\n2. Starting Position\nExtend your legs back so your body forms a straight line from head to heels. Core stable, arms fully extended.\n3. Movement\nBend your elbows and lower your chest toward your hands. Keep elbows close to your torso.\n4. Bottom Position\nLower until your chest is almost touching your hands.\n5. Return\nPush through your palms and fully extend your arms to return to the start. Primary load is on the triceps.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- A narrow hand position maximizes triceps loading.\n- Elbows should track close to the torso - flaring them reduces triceps emphasis.\n- If the exercise is too difficult, slightly widen your hand placement while keeping it narrower than shoulder width. 💪',
  },
  [normalizeExerciseName('Pike Push-Ups')]: {
    muscles: 'Shoulders (anterior delts), triceps',
    technique:
      '1. Position\nStart in a push-up position, then walk your feet closer to your hands, raising your hips to form an inverted V shape.\n2. Starting Position\nHands shoulder-width apart, hips high, head between your arms, eyes toward the floor. Maintain about a 90 degree angle at the hips.\n3. Movement\nBend your elbows and lower the crown of your head toward the floor. Keep elbows at about a 45 degree angle.\n4. Bottom Position\nLower until your head almost touches the floor.\n5. Return\nPush through your palms and straighten your arms to return to the starting position.\n6. Breathing\nExhale on the way up and inhale on the way down.\n\nKey points:\n- This is a bodyweight shoulder-press variation - the more vertical your torso, the higher the load.\n- Keep your hips high throughout and do not turn it into a regular push-up.\n- To make it harder, elevate your feet to increase load and move closer to handstand push-up mechanics. 💪',
  },
  [normalizeExerciseName('Dumbbell/Water Bottle Shoulder Press')]: {
    muscles: 'Anterior delts, lateral delts, triceps',
    technique:
      '1. Setup\nStand or sit upright holding weights (dumbbells or heavy bottles) at shoulder height, palms facing forward.\n2. Starting Position\nWeights at shoulder level, elbows at about 90 degrees, core engaged.\n3. Press\nPress both weights straight overhead until arms are fully extended.\n4. Top Position\nWeights close together at the top. Squeeze shoulders briefly.\n5. Lower\nSlowly lower the weights back to shoulder height.\n\nKey points:\n- Keep your core braced to prevent arching your lower back.\n- Press straight up, not forward.\n- Use whatever heavy objects you have: bottles, cans, loaded bags.',
  },
  [normalizeExerciseName('Arnold Press (Home Version)')]: {
    muscles: 'Anterior delts, lateral delts',
    technique:
      'Technique\n1. Position\nSit or stand holding the load at shoulder level. Palms face toward you.\n\n2. Starting Position\nLoad is in front of your face, elbows brought forward, palms facing you.\n\n3. Movement\nPress the load upward while rotating the palms outward at the same time. Midway through, palms face to the sides.\n\n4. Top Position\nFully extend your arms with palms now facing forward. Squeeze the shoulders.\n\n5. Return\nSlowly lower the load while rotating the palms back toward you.\n\n6. Breathing\nExhale on the press and inhale on the way down.\n\nKey points\nRotation increases load on the middle deltoid fibers\nPressing and rotation are performed simultaneously without pauses\nUse lighter weight than in a standard shoulder press to maintain control 💪',
  },
  [normalizeExerciseName('Lateral Raises (DB/Bottle/Band)')]: {
    muscles: 'Lateral delts',
    technique:
      '1. Position\nStand upright, holding the load or band handles at your sides.\n2. Starting Position\nArms along your torso, elbows slightly bent and fixed. Shoulders down.\n3. Movement\nRaise your arms out to the sides until shoulder height.\n4. Top Position\nPause for 1 second at shoulder height. Slightly rotate your pinkies upward for better delt activation.\n5. Return\nSlowly lower your arms back down along your sides.\n6. Breathing\nExhale on the raise and inhale on the lowering phase.\n\nKey points:\n- Lead the movement with your elbows, not your hands.\n- Do not raise above shoulder height - higher than that shifts load to the traps.\n- Light weight with strict form is more effective than heavy weight with swinging. 💪',
  },
  [normalizeExerciseName('Front Raises (DB/Bottle/Band)')]: {
    muscles: 'Anterior delts',
    technique:
      'Technique\n1. Position\nStand upright, holding the load or band in front of your thighs.\n\n2. Starting Position\nArms are down with a slight bend in the elbows. Torso is stable.\n\n3. Movement\nRaise your arms forward and up to shoulder height. Arms remain nearly straight.\n\n4. Top Position\nHold at shoulder height for 1 second. Squeeze the front delts.\n\n5. Return\nSlowly lower your arms back to the starting position.\n\n6. Breathing\nExhale on the raise and inhale on the way down.\n\nKey points\nDo not raise above shoulder height; higher shifts load to the trapezius muscles\nKeep the torso upright and avoid leaning backward\nCan be performed alternating arms or both arms simultaneously 💪',
  },
  [normalizeExerciseName('Rear Delt Raises (Bend Over)')]: {
    muscles: 'Rear delts, upper back',
    technique:
      '1. Setup\nStand with feet shoulder-width apart, hinge forward at the hips to about 45-60 degrees. Hold weights or band below your chest.\n2. Starting Position\nArms hanging down with slight elbow bend, palms facing each other.\n3. Raise\nLift arms out to the sides, squeezing rear delts and upper back.\n4. Top Position\nPause when arms reach torso level. Squeeze shoulder blades together.\n5. Lower\nSlowly lower back to the starting position.\n\nKey points:\n- Focus on squeezing shoulder blades together at the top.\n- Keep the hinge angle constant — do not stand up as you raise.\n- Use very light weight; rear delts respond to control, not load.',
  },
  [normalizeExerciseName('Band Face Pulls')]: {
    muscles: 'Rear delts, external rotators, upper back',
    technique:
      '1. Position\nAnchor the band at face height (door, rack, or stable support). Grip the band ends with palms facing down.\n2. Starting Position\nStep back to create tension. Arms extended forward at face level.\n3. Movement\nPull the band toward your face by driving elbows back and out. As you pull, separate the band ends.\n4. Top Position\nAt the end position, hands are near your ears with elbows high. Squeeze your shoulder blades and hold for 1-2 seconds.\n5. Return\nSlowly extend your arms back to the starting position.\n6. Breathing\nExhale during the pull and inhale during the return.\n\nKey points:\n- One of the best exercises for shoulder health - perform it regularly.\n- Keep elbows at shoulder level or higher throughout the movement.\n- Add external rotation at the top: hands by ears, thumbs pointing back. 💪',
  },
  [normalizeExerciseName('Wall Handstand Hold')]: {
    muscles: 'Shoulders, triceps, core',
    technique:
      '1. Setup\nFace the wall and place your hands about 6 inches from the base of the wall, shoulder-width apart.\n2. Kick Up\nKick one leg up, followed by the other, to get into a handstand position with your heels resting against the wall.\n3. Hold\nMaintain the handstand: arms extended, core tight, body in a straight line. Look at the ground between your hands.\n4. Breathing\nBreathe steadily — do not hold your breath. Keep your body engaged.\n5. Come Down\nSlowly lower one leg at a time to return to standing.\n\nKey points:\n- This is an advanced exercise; make sure you are comfortable with pike push-ups first.\n- Keep your core tight and ribs down to prevent over-arching.\n- Start with short holds (10-15 seconds) and build up.',
  },
  [normalizeExerciseName('Wall Pike Shoulder Hold')]: {
    muscles: 'Shoulders, triceps, core',
    technique:
      '1. Setup\nFace away from the wall. Place feet on the wall (mid-height) and walk your hands backward toward the wall.\n2. Pike Position\nYour body forms an L-shape or inverted V: feet on wall, hands on floor, hips high.\n3. Hold\nMaintain the position with arms extended and shoulders active (pushing the floor away).\n4. Maintain Engagement\nKeep core tight, breathe steadily, and maintain pressure through your palms.\n5. Release\nWalk your hands forward and lower your feet from the wall to finish.\n\nKey points:\n- This is a regression from a full wall handstand hold — build up to it.\n- Push the floor away to keep your shoulders active and engaged.\n- Great for building overhead pressing strength with bodyweight.',
  },
  [normalizeExerciseName('Crunches')]: {
    muscles: 'Rectus abdominis',
    technique:
      '1. Setup\nLie on your back with knees bent and feet flat on the floor, hip-width apart. Place hands near your temples or cross them over your chest.\n2. Starting Position\nBrace your core and press your lower back lightly into the floor. Maintain this connection throughout.\n3. Curl Up\nLift your shoulder blades off the floor by flexing your spine. The movement comes from your abs, not from pulling your neck.\n4. Top Position\nPause briefly at the top and exhale fully to maximize the contraction.\n5. Lower\nSlowly lower your shoulder blades back to the floor with control.\n\nKey points:\n- The range of motion is small — only lift until your shoulder blades clear the floor.\n- Never pull on your neck; keep your chin slightly tucked with a fist-width gap.\n- Exhale on the way up for deeper ab contraction.',
  },
  [normalizeExerciseName('Crunch')]: {
    muscles: 'Rectus abdominis',
    technique:
      '1. Setup\nLie on your back with knees bent and feet flat on the floor. Hands near your temples or crossed over your chest.\n2. Starting Position\nCore braced, lower back pressed lightly into the floor.\n3. Curl Up\nLift your shoulder blades off the floor by flexing your spine. Focus on shortening the distance between your ribs and hips.\n4. Top Position\nPause briefly and exhale fully at the top of the movement.\n5. Lower\nSlowly lower back to the floor with control.\n\nKey points:\n- The movement is small and controlled — no need to sit up fully.\n- Keep your chin slightly tucked; do not pull your head with your hands.\n- Focus on squeezing your abs, not on speed.',
  },
  [normalizeExerciseName('Reverse Crunches')]: {
    muscles: 'Lower abs, hip flexors',
    technique:
      '1. Setup\nLie on your back with arms at your sides, palms down. Lift your legs so your knees are bent at 90 degrees.\n2. Starting Position\nBrace your abs and keep your lower back pressed into the floor.\n3. Curl Hips\nContract your abs to tilt your pelvis and lift your hips slightly off the floor, bringing your knees toward your chest.\n4. Top Position\nPause at the peak contraction for 1 second. Exhale fully.\n5. Lower\nSlowly lower your hips back to the floor under control. Do not swing your legs.\n\nKey points:\n- The movement is a pelvic curl, not a leg swing — focus on your abs lifting the hips.\n- Keep the motion slow and controlled; momentum removes ab activation.\n- Keep your upper back and head relaxed on the floor throughout.',
  },
  [normalizeExerciseName('Reverse Crunch')]: {
    muscles: 'Lower abs, hip flexors',
    technique:
      '1. Setup\nLie on your back with arms at your sides. Lift your legs with knees bent at 90 degrees.\n2. Starting Position\nAbs braced, lower back in contact with the floor.\n3. Curl Hips\nUse your abs to tilt your pelvis and curl your hips off the floor, bringing knees toward your chest.\n4. Top Position\nPause at peak contraction for 1 second.\n5. Lower\nSlowly lower your hips back to the floor.\n\nKey points:\n- Focus on the pelvic tilt — your abs do the lifting, not your legs.\n- Avoid swinging or using momentum; each rep should be deliberate.\n- Great for targeting the lower portion of the rectus abdominis.',
  },
  [normalizeExerciseName('Dead Bug')]: {
    muscles: 'Transverse abdominis, rectus abdominis, deep core stabilizers, hip flexors',
    technique:
      '1. Setup\nLie on your back with arms extended toward the ceiling and hips/knees bent at 90 degrees (tabletop). Press your lower back gently into the floor.\n2. Brace\nExhale and brace your core as if tightening a belt around your waist. Keep ribs down and neck relaxed.\n3. Alternate Leg Extension\nSlowly extend one leg forward until the heel is just above the floor while the other leg stays in tabletop. Keep both arms fixed vertically.\n4. Return and Switch\nBring the extended leg back to tabletop under control, then repeat with the opposite leg. Continue alternating sides rep by rep.\n5. Maintain Control\nMove at a slow, even tempo while keeping your lower back in contact with the floor through every rep.\n\nKey points:\n- This variation uses alternating legs only: do not move your arms.\n- If your lower back arches, shorten the leg range immediately.\n- Exhale during each leg extension to improve deep-core activation and spinal control.',
  },
  [normalizeExerciseName('Bicycle Crunches')]: {
    muscles: 'Rectus abdominis, obliques',
    technique:
      '1. Setup\nLie on your back with hands near your temples and knees lifted, shins parallel to the floor.\n2. Starting Position\nSlightly lift your shoulder blades off the floor. Core engaged, lower back pressed down.\n3. Pedal and Rotate\nBring one elbow toward the opposite knee while extending the other leg straight out. Rotate through the torso.\n4. Alternate\nSwitch sides in a controlled rhythm, keeping the movement smooth and deliberate.\n5. Maintain Form\nKeep your lower back stable against the floor throughout all reps.\n\nKey points:\n- The rotation should come from your trunk, not from pulling your neck or elbows.\n- Extend the straight leg fully for maximum oblique engagement.\n- Slow, controlled reps are far more effective than fast, sloppy ones.',
  },
  [normalizeExerciseName('Russian Twist')]: {
    muscles: 'Obliques, rectus abdominis',
    technique:
      '1. Setup\nSit on the floor with knees bent and feet flat (or elevated for more difficulty). Hold a weight, ball, or clasp your hands together.\n2. Starting Position\nLean your torso back to about 45 degrees, core braced, chest up.\n3. Rotate\nRotate your shoulders to one side, bringing the weight beside your hip. Move from the trunk, not just the arms.\n4. Switch\nRotate to the other side in a controlled motion. Keep your hips stable and facing forward.\n5. Rhythm\nContinue alternating with steady breathing and a controlled tempo.\n\nKey points:\n- Keep your chest up throughout — do not collapse your posture as you fatigue.\n- The rotation comes from the obliques; your hips and lower body should stay still.\n- Lifting feet off the floor increases core demand but requires more balance.',
  },
  [normalizeExerciseName('Leg Raises')]: {
    muscles: 'Lower abs, hip flexors',
    technique:
      '1. Setup\nLie flat on your back with legs extended and hands placed under your hips or at your sides for support.\n2. Starting Position\nBrace your abs and press your lower back into the floor. Legs together and straight.\n3. Raise\nLift your legs upward while keeping them straight (or with a slight bend). Raise until legs are vertical or as high as you can without your lower back arching.\n4. Top Position\nPause briefly with legs raised.\n5. Lower\nSlowly lower your legs back toward the floor. Stop before your lower back starts to arch, then raise again.\n\nKey points:\n- Maintain lower back contact with the floor — if it arches, you have gone too low.\n- Keep constant abdominal tension; do not let your legs drop.\n- Bending your knees slightly makes the exercise easier if fully straight legs are too challenging.',
  },
  [normalizeExerciseName('Single Leg Raises')]: {
    muscles: 'Lower abs, hip flexors, deep core stabilizers',
    technique:
      '1. Setup\nLie on your back with both legs extended and hands under your hips or by your sides for support. Brace your core.\n2. Starting Position\nKeep one leg extended on or just above the floor while the working leg is ready to move. Press your lower back into the floor.\n3. Raise One Leg\nLift the working leg upward in a controlled motion while keeping the other leg stable. Move only as high as you can without losing core tension.\n4. Lower with Control\nLower the working leg slowly back to start without letting it drop. Keep your pelvis steady and lower back grounded.\n5. Switch Sides\nComplete reps on one side, then switch to the other leg (or alternate rep by rep).\n\nKey points:\n- Keep the non-working leg stable to increase anti-rotation core demand.\n- If your lower back lifts, reduce the range and slow the tempo.\n- Controlled reps are more effective than high speed in this variation.',
  },
  [normalizeExerciseName('Plank')]: {
    muscles: 'Transverse abdominis, rectus abdominis, glutes',
    technique:
      '1. Setup\nGet into a forearm plank position: elbows directly under your shoulders, forearms flat on the ground.\n2. Body Alignment\nExtend your legs behind you, resting on your toes. Form a straight line from head to heels.\n3. Brace\nSqueeze your glutes and brace your core to maintain a neutral spine. Do not let your hips sag or pike upward.\n4. Hold\nBreathe steadily through the hold. Keep your head neutral, looking at the floor between your hands.\n5. Finish\nHold for the prescribed time. Stop when your form starts to break.\n\nKey points:\n- A properly braced core protects the lower back — imagine pulling your belly button toward your spine.\n- Common mistakes: hips sagging (weak core) or piking upward (too easy).\n- Quality of position matters more than hold time; good form for 30 seconds beats sloppy form for 2 minutes.',
  },
  [normalizeExerciseName('Plank with steps')]: {
    muscles: 'Core, shoulders, hip stabilizers',
    technique:
      '1. Setup\nGet into a strong forearm or high plank position with your body in a straight line.\n2. Starting Position\nCore braced, hips level, shoulders stacked over elbows or wrists.\n3. Step Out\nStep one foot out to the side while keeping hips level and your trunk rigid.\n4. Step In\nBring the foot back and repeat on the other side. Keep alternating.\n5. Maintain\nContinue at a stable, controlled tempo with clean form throughout.\n\nKey points:\n- Keep your hips steady and level — the goal is to resist rotation and lateral movement.\n- Use short, controlled steps; bigger steps make it harder to maintain form.\n- This exercise trains anti-rotation core stability, not speed.',
  },
  [normalizeExerciseName('Fast Plank Steps')]: {
    muscles: 'Core, shoulders, hip stabilizers',
    technique:
      '1. Setup\nGet into a plank position with shoulders stacked over elbows or wrists, body in a straight line.\n2. Starting Position\nCore braced, neutral spine, feet about hip-width apart.\n3. Quick Steps\nMove your feet quickly in small steps while keeping your trunk rigid and hips stable.\n4. Maintain\nKeep your pelvis steady and avoid side-to-side sway. Control your breathing despite the higher pace.\n5. Adjust\nReduce speed if your form starts to deteriorate.\n\nKey points:\n- Speed is secondary to form — a rigid trunk with fast feet is the goal.\n- Keep hips level; bouncing hips means you need to slow down.\n- Great for building core endurance under dynamic conditions.',
  },
  [normalizeExerciseName('Scissors')]: {
    muscles: 'Lower abs, hip flexors',
    technique:
      '1. Setup\nLie on your back with arms at your sides or hands under your hips for lower-back support. Core braced.\n2. Starting Position\nLift both legs slightly off the floor (a few inches). Press your lower back gently into the floor.\n3. Cross\nAlternate crossing one leg over the other in a scissor-like motion, keeping legs straight.\n4. Tempo\nUse a controlled, even tempo — not too fast. Each crossing is deliberate.\n5. Maintain\nContinue for the prescribed reps or time. Keep lower back pressed down throughout.\n\nKey points:\n- Keep your lower back pressed into the floor — if it arches, raise your legs higher.\n- Avoid neck tension; keep your head on the floor or slightly lifted.\n- Lower leg height increases difficulty but only do so if you can maintain back position.',
  },
  [normalizeExerciseName('Scissor Kicks')]: {
    muscles: 'Lower abs, hip flexors, deep core stabilizers',
    technique:
      '1. Setup\nLie on your back with arms at your sides or hands lightly under your hips for support. Brace your core and keep ribs down.\n2. Starting Position\nLift both legs a few inches off the floor with knees mostly straight. Press your lower back into the floor.\n3. Alternating Kicks\nKick one leg upward while the other stays lower, then switch in a smooth alternating rhythm. Keep the movement small and controlled.\n4. Breathing and Control\nExhale during each switch and keep your pelvis steady. Avoid bouncing or swinging the legs.\n5. Finish\nContinue for the target time/reps, then lower both legs with control while keeping core tension.\n\nKey points:\n- Keep constant lower-back contact with the floor; if you lose it, raise your leg angle.\n- Movement comes from controlled hip flexion with a braced core, not from momentum.\n- Small, strict alternating kicks are more effective than large fast swings.',
  },
  [normalizeExerciseName('Heel Touches')]: {
    muscles: 'Obliques, rectus abdominis, transverse abdominis',
    technique:
      '1. Setup\nLie on your back with knees bent, feet flat, and heels close to your glutes. Arms by your sides, shoulder blades slightly lifted off the floor.\n2. Brace\nPress your lower back gently into the floor, brace your core, and keep your chin neutral (do not pull your neck forward).\n3. Reach Right\nSlide your right hand toward your right heel by side-bending your torso. Keep hips steady and movement controlled.\n4. Reach Left\nReturn to center, then slide your left hand toward your left heel. Continue alternating side to side with an even tempo.\n5. Maintain Form\nKeep shoulder blades elevated, ribs down, and core tension constant until the set ends.\n\nKey points:\n- The movement is a small side crunch, not a full sit-up.\n- Keep your lower back grounded and avoid rocking through the hips.\n- Reach with your torso (obliques), not by swinging your arms.',
  },
  [normalizeExerciseName('Seated Knee Tucks')]: {
    muscles: 'Lower abs, rectus abdominis, hip flexors, deep core stabilizers',
    technique:
      '1. Setup\nSit on the floor or bench with hands lightly behind you for balance, chest up, and knees bent. Lean back slightly with a neutral spine.\n2. Brace\nEngage your core and keep ribs down before starting. Feet hover slightly off the floor.\n3. Tuck\nPull both knees toward your chest while simultaneously drawing your torso slightly forward. Keep the motion controlled and centered through the abs.\n4. Extend\nSlowly extend your legs forward while leaning back to the start position, without collapsing your lower back.\n5. Repeat\nContinue with a smooth tempo, maintaining constant tension and clean form through every rep.\n\nKey points:\n- Move from your core, not from swinging your shoulders or kicking your legs.\n- Keep your chest open and avoid rounding excessively through the lower back.\n- Shorten the extension range if you cannot keep abdominal tension and control.',
  },
  [normalizeExerciseName('Reverse Plank')]: {
    muscles: 'Glutes, hamstrings, posterior chain, deep core stabilizers, shoulders',
    technique:
      '1. Setup\nSit on the floor with legs extended straight in front of you. Place your hands on the floor slightly behind your hips, fingers pointing forward or slightly out.\n2. Brace and Lift\nPress through your palms and heels to lift your hips up. Keep your chest open and shoulders pulled down away from your ears.\n3. Alignment\nAt the top, form a straight line from shoulders through hips to ankles. Squeeze glutes and keep core braced.\n4. Hold\nMaintain the position with steady breathing and neutral neck (look toward the ceiling or slightly forward).\n5. Lower\nLower your hips back down with control, then reset for the next rep or hold interval.\n\nKey points:\n- Drive hip extension from glutes, not from lower-back overarch.\n- Keep shoulders stable and avoid shrugging toward your ears.\n- If full straight-leg version is too hard, bend knees slightly to maintain clean alignment.',
  },
  [normalizeExerciseName('Bench Crunches')]: {
    muscles: 'Rectus abdominis, transverse abdominis, hip flexors',
    technique:
      '1. Setup\nSit on a flat bench with your hips near the edge. Hold the bench sides for support and lean back slightly with your chest up.\n2. Starting Position\nLift your feet off the floor with knees bent. Brace your core and keep your lower back stable.\n3. Crunch In\nBring your knees toward your chest while curling your torso slightly forward, shortening the distance between ribs and hips.\n4. Extend Out\nSlowly extend your legs forward and lean back to the start position under control, without collapsing your lower back.\n5. Repeat\nContinue with a controlled tempo and constant abdominal tension for the full set.\n\nKey points:\n- This is a controlled in-and-out crunch, not a swinging leg motion.\n- Keep your core braced and avoid excessive lower-back rounding.\n- Exhale on the crunch-in phase to increase ab contraction.',
  },
  [normalizeExerciseName('Side Crunches on Bench')]: {
    muscles: 'Obliques, rectus abdominis, deep core stabilizers',
    technique:
      '1. Setup\nSit sideways on a flat bench with one hip near the edge. Place one hand lightly behind your head and the other hand on the bench for balance.\n2. Starting Position\nLean your torso slightly away from the bench side to preload the obliques. Keep chest open and core braced.\n3. Side Crunch\nBend laterally through your torso to crunch upward on the same side, bringing your ribcage toward your hip.\n4. Controlled Return\nSlowly lower back to the stretched position under control without collapsing or rotating the torso.\n5. Switch Sides\nComplete all reps on one side, then change position and repeat on the opposite side.\n\nKey points:\n- Movement is side-bending only; avoid twisting the shoulders.\n- Keep hips stable on the bench to isolate obliques.\n- Use a small controlled range and focus on squeeze, not speed.',
  },
  [normalizeExerciseName('Bench Reverse Crunch')]: {
    muscles: 'Lower abs, rectus abdominis, hip flexors, deep core stabilizers',
    technique:
      '1. Setup\nLie on a flat bench and grip the sides or bench edge above your head for stability. Bend your knees to about 90 degrees.\n2. Starting Position\nBrace your core and press your lower back into the bench. Keep your upper body relaxed and stable.\n3. Reverse Crunch Up\nTilt your pelvis and draw your knees toward your chest, lifting your hips slightly off the bench using your abs.\n4. Peak Contraction\nPause briefly at the top while exhaling fully and maintaining control.\n5. Lower\nSlowly lower your hips and knees back to the start position without swinging your legs.\n\nKey points:\n- Focus on pelvic curl (hips lifting), not just knee movement.\n- Keep the motion controlled; momentum reduces lower-ab activation.\n- If your lower back arches on the way down, reduce range and slow the tempo.',
  },
  [normalizeExerciseName('Side Plank')]: {
    muscles: 'Obliques, glute medius, deep core',
    technique:
      '1. Setup\nLie on your side with your elbow directly under your shoulder. Stack your feet or stagger them for more stability.\n2. Lift\nLift your hips off the floor to create a straight line from your head to your heels.\n3. Hold\nMaintain the position with a braced core. Keep your ribs down and neck in a neutral position.\n4. Breathe\nHold with steady breathing. Do not hold your breath.\n5. Lower and Switch\nSlowly lower your hips with control to finish. Repeat on the other side.\n\nKey points:\n- Keep your hips stacked vertically — the most common error is letting the top hip roll forward.\n- If stacking feet is too challenging, stagger them or place the top foot in front.\n- Side planks are one of the best exercises for oblique and glute medius activation.',
  },
  [normalizeExerciseName('Hanging Knee Raises')]: {
    muscles: 'Lower abs, hip flexors, grip',
    technique:
      '1. Setup\nHang from a pull-up bar with an overhand grip, arms fully extended. Shoulders active (pulling down slightly).\n2. Starting Position\nBody straight, core engaged, legs hanging freely. Minimize swinging.\n3. Raise\nBrace your abs and raise your knees by curling your pelvis upward. Bring knees toward your chest.\n4. Top Position\nPause briefly at the top with knees raised and abs contracted.\n5. Lower\nSlowly lower your legs back to the hanging position under full control.\n\nKey points:\n- The key is the pelvic tilt — curl your pelvis upward, do not just lift your legs with hip flexors.\n- Avoid swinging or kipping; each rep should be controlled and deliberate.\n- If you swing, pause between reps to let your body settle before the next one.',
  },
  [normalizeExerciseName('Hanging Leg Raises')]: {
    muscles: 'Lower abs, hip flexors, grip',
    technique:
      '1. Setup\nHang from a pull-up bar with an overhand grip, arms fully extended. Shoulders active and engaged.\n2. Starting Position\nBody straight, core braced, legs hanging together. Minimize any swing.\n3. Raise\nRaise your straight legs upward by engaging your abs first and tilting your pelvis. Keep legs together.\n4. Top Position\nRaise legs to parallel or higher if possible. Pause near the top without collapsing your posture.\n5. Lower\nSlowly lower your legs back to the starting position under complete control.\n\nKey points:\n- Straight-leg raises are significantly harder than knee raises — build up to them.\n- The pelvic tilt is what engages the abs; without it, the hip flexors do most of the work.\n- Keep your torso stable; excessive swinging means the weight is being moved by momentum, not abs.',
  },
  [normalizeExerciseName('Burpees')]: {
    muscles: 'Full body with emphasis on legs, chest, core',
    technique:
      '1. Start\nStand tall with feet shoulder-width apart, arms at your sides.\n2. Drop\nBend down and place your hands on the floor in front of you. Jump your feet back to land in a plank position.\n3. Push-Up (optional)\nKeep your core braced. If programmed, perform a push-up at the bottom.\n4. Jump Forward\nJump your feet back under your hips with control.\n5. Explode Up\nExplode upward into a vertical jump, reaching your arms overhead. Land softly and immediately begin the next rep.\n\nKey points:\n- Quality reps beat fast sloppy reps — maintain a rigid plank position in the middle.\n- Land softly from the jump with bent knees to protect your joints.\n- Control the transition from plank to standing; do not round your back.',
  },
  [normalizeExerciseName('Mountain Climbers')]: {
    muscles: 'Core, shoulders, hip flexors',
    technique:
      '1. Setup\nGet into a high plank position with hands directly under your shoulders, arms fully extended.\n2. Starting Position\nBody in a straight line, core braced, weight evenly distributed.\n3. Drive\nDrive one knee toward your chest while keeping your hips low and level.\n4. Alternate\nReturn the leg to plank and immediately drive the opposite knee forward. Keep alternating at a steady pace.\n5. Maintain Form\nKeep your core tight, breathing rhythmic, and hips from bouncing. Slow down if your pelvis starts to rotate.\n\nKey points:\n- Keep hips level and stable — bouncing hips means you are going too fast for your ability.\n- The exercise is meant to be a combination of core work and cardio.\n- Think of running in a plank position with controlled, even strides.',
  },
  [normalizeExerciseName('Jumping Jacks')]: {
    muscles: 'Full body with emphasis on calves, shoulders, core',
    technique:
      '1. Starting Position\nStand tall with feet together, arms at your sides, knees slightly soft.\n2. Jump Out\nJump both feet out to wider than shoulder-width while simultaneously raising your arms overhead.\n3. Top Position\nBriefly touch your hands overhead (or clap).\n4. Jump In\nJump feet back together and lower arms to your sides.\n5. Rhythm\nMaintain a consistent pace with controlled, low-impact landings.\n\nKey points:\n- Land softly on the balls of your feet to protect your joints.\n- Keep your core engaged and torso upright throughout.\n- Adjust the pace to match your fitness level — there is no need to rush.',
  },
  [normalizeExerciseName('High Knees')]: {
    muscles: 'Hip flexors, calves, core',
    technique:
      '1. Starting Position\nStand tall with feet hip-width apart, arms at your sides.\n2. Drive\nRun in place, driving one knee up toward hip height with each step.\n3. Arm Action\nPump your arms naturally in sync with your legs to maintain rhythm and balance.\n4. Landing\nLand on the mid-foot with soft contact. Stay light on your feet.\n5. Pace\nKeep your core braced and breathing controlled. Maintain a consistent tempo.\n\nKey points:\n- Focus on knee height — actively drive knees up rather than just jogging in place.\n- Stay tall; do not lean forward or hunch your shoulders.\n- This is both a cardio exercise and a hip flexor strengthener.',
  },
  [normalizeExerciseName('Squat to Knee squat')]: {
    muscles: 'Quads, glutes, core, hip flexors',
    technique:
      '1. Setup\nStand with feet shoulder-width apart, chest up, and core braced.\n2. Squat\nLower into a controlled squat by pushing hips back and bending knees.\n3. Stand + Knee Drive\nDrive up to standing and lift one knee toward your chest.\n4. Repeat\nReturn that foot down, perform another squat, then lift the opposite knee.\n5. Rhythm\nContinue alternating knee drives each rep with smooth tempo and balance.\n\nKey points:\n- Keep heels grounded during the squat phase.\n- Drive the knee up using your core, not by leaning backward.\n- Keep the movement controlled instead of rushing.',
  },
  [normalizeExerciseName('Lunge Jumps')]: {
    muscles: 'Quads, glutes, hamstrings, calves',
    technique:
      '1. Setup\nStart in a split-lunge position with one leg forward and one leg back.\n2. Lower\nBend both knees to about 90 degrees with torso upright.\n3. Jump\nExplode upward and switch legs mid-air.\n4. Land\nLand softly in the opposite lunge stance with knees bent.\n5. Continue\nRepeat in a steady alternating pattern while keeping balance.\n\nKey points:\n- Land softly to reduce joint stress.\n- Keep front knee tracking over toes, not collapsing inward.\n- Reduce jump height if form breaks.',
  },
  [normalizeExerciseName('Skater Jumps')]: {
    muscles: 'Glutes, quads, adductors, calves, core',
    technique:
      '1. Setup\nStand on one leg with slight knee bend and hips back.\n2. Lateral Jump\nJump sideways to the opposite leg in a skating motion.\n3. Arm Swing\nUse your arms for balance and momentum as you travel side to side.\n4. Land\nLand softly on one leg, keeping knee bent and chest up.\n5. Alternate\nImmediately jump back to the other side with control.\n\nKey points:\n- Focus on stable single-leg landing before next jump.\n- Keep torso from collapsing forward on landing.\n- Push through the floor laterally, not upward only.',
  },
  [normalizeExerciseName('Tuck Jumps')]: {
    muscles: 'Quads, hip flexors, calves, core',
    technique:
      '1. Setup\nStand tall with feet hip-width apart and arms ready to swing.\n2. Dip\nPerform a shallow quarter squat to load your legs.\n3. Jump\nExplode up and pull knees toward your chest in the air.\n4. Land\nLand softly with knees bent and chest upright.\n5. Reset\nStabilize quickly and repeat next rep with control.\n\nKey points:\n- Prioritize soft, quiet landings.\n- Keep chest lifted and avoid collapsing inward at the knees.\n- Do fewer reps with quality rather than sloppy jumps.',
  },
  [normalizeExerciseName('Inchworms')]: {
    muscles: 'Core, shoulders, chest, hamstrings',
    technique:
      '1. Setup\nStand with feet hip-width apart and slight bend in knees.\n2. Walk Out\nHinge forward, place hands on floor, and walk hands out to a high plank.\n3. Plank Hold\nPause briefly in plank with core tight and body straight.\n4. Walk In\nWalk feet toward hands in small steps while keeping legs mostly straight.\n5. Stand\nReturn to standing and repeat the sequence.\n\nKey points:\n- Keep core braced in plank to prevent lower-back sag.\n- Move with control through shoulders and hamstrings.\n- Bend knees slightly if hamstrings are tight.',
  },
  [normalizeExerciseName('Barbell Squat')]: {
    muscles: 'Quadriceps, glutes, adductors, core',
    technique:
      '1. Setup\nSet the bar securely on your upper back (high bar on traps, or low bar across rear delts). Unrack by standing up with the bar and stepping back.\n2. Starting Position\nFeet shoulder-width apart, toes slightly out. Core braced, chest up, eyes forward.\n3. Descent\nPush your hips back and bend your knees simultaneously. Keep knees tracking over toes and your torso stable.\n4. Bottom Position\nDescend to at least parallel (thighs parallel to the floor) or deeper if mobility allows, without losing neutral spine.\n5. Stand Up\nDrive up through mid-foot and heels, extending hips and knees together.\n\nKey points:\n- Keep your core braced throughout — a strong brace protects your spine.\n- Knees should track in the direction your toes point; do not let them cave inward.\n- The barbell squat is the most important lower body exercise — prioritize technique over weight.',
  },
  [normalizeExerciseName('Leg Press')]: {
    muscles: 'Quadriceps, glutes, hamstrings',
    technique:
      '1. Setup\nSit in the leg press machine with your lower back pressed firmly into the pad. Place feet shoulder-width apart on the platform.\n2. Starting Position\nUnlock the sled. Legs extended with a slight bend in the knees — never fully locked out.\n3. Lower\nBend your knees to lower the platform toward you in a controlled manner. Lower until knees reach about 90 degrees.\n4. Press\nPush the platform away by extending your legs. Drive through your heels and mid-foot.\n5. Top Position\nExtend to near-full extension without hard knee lockout.\n\nKey points:\n- Keep your lower back pressed into the pad; if it lifts, you are going too deep.\n- Never lock your knees at the top — keep a slight bend for joint safety.\n- Foot placement changes the emphasis: high = more glutes/hamstrings, low = more quads.',
  },
  [normalizeExerciseName('Romanian Deadlift with dumbbell/barbell')]: {
    muscles: 'Hamstrings, glutes, lower back',
    technique:
      '1. Setup\nStand tall with feet hip-width apart, holding a barbell in front of your thighs or dumbbells at your sides.\n2. Starting Position\nSoft knees (slightly bent and locked in position throughout). Core braced, back straight.\n3. Hinge\nPush your hips back and lower the weight along your legs by hinging at the hips. Keep the weight close to your body.\n4. Bottom Position\nDescend until you feel a strong stretch in your hamstrings, generally around mid-shin level. Do not round your back.\n5. Stand Up\nDrive your hips forward to return to standing. Squeeze glutes at the top.\n\nKey points:\n- The RDL is a hip hinge, not a squat — knees stay softly bent in the same position throughout.\n- Keep the weight close to your legs; the barbell should slide along your thighs and shins.\n- Stop at the depth where you feel a hamstring stretch; going lower with a rounded back defeats the purpose.',
  },
  [normalizeExerciseName('Deadlift with dumbbell/barbell/Smith')]: {
    muscles: 'Glutes, hamstrings, spinal erectors, quads',
    technique:
      '1. Setup\nStand with feet hip-width apart, shins close to the bar. Hinge at the hips to grip the bar just outside your legs.\n2. Starting Position\nFlatten your back, engage your lats (pull shoulders back), and brace your core. Create full-body tension.\n3. Pull\nPush the floor away with your legs while keeping the bar close to your body. Extend hips and knees together.\n4. Lockout\nStand fully tall without overextending your lower back. Shoulders back, glutes squeezed.\n5. Lower\nHinge at the hips first, then bend your knees once the bar passes them. Return the bar to the floor with control.\n\nKey points:\n- The deadlift is a full-body exercise — upper body tightness is just as important as leg drive.\n- Keep the bar close to your body throughout; if it drifts forward, your lower back bears excess load.\n- Brace your core hard before every rep — this protects your spine under heavy loads.',
  },
  [normalizeExerciseName('Lat Pulldown (wide grip)')]: {
    muscles: 'Lats, upper back, biceps',
    technique:
      '1. Setup\nSit at the lat pulldown machine. Secure your thighs under the pad. Grip the bar with a wide overhand grip (1.5x shoulder-width).\n2. Starting Position\nArms fully extended overhead, torso upright, chest up. Engage your core.\n3. Pull\nStart the pull by depressing your shoulder blades. Drive your elbows down toward your ribs until the bar reaches your upper chest.\n4. Bottom Position\nSqueeze your lats at the bottom for 1 second. Keep your chest up and avoid swinging your torso.\n5. Return\nSlowly return the bar to the top with full arm extension, feeling the stretch in your lats.\n\nKey points:\n- Initiate the pull with your shoulder blades, not your biceps.\n- Avoid swinging or leaning back excessively — a slight lean is fine, but excessive lean turns it into a row.\n- Wide grip targets the outer lats for a wider back appearance.',
  },
  [normalizeExerciseName('Underhand Lat Pulldown')]: {
    muscles: 'Lats (lower fibers), mid-back, biceps',
    technique:
      '1. Setup\nSit at the lat pulldown machine and secure your thighs under the pad. Grip the bar with an underhand (supinated) shoulder-width grip.\n2. Starting Position\nArms fully extended overhead, chest up, slight natural lean back, core braced.\n3. Pull\nInitiate by depressing your shoulder blades, then drive elbows down and slightly back to pull the bar toward your upper chest.\n4. Peak Contraction\nPause for 1 second at the bottom and squeeze lats/biceps without shrugging shoulders.\n5. Return\nSlowly let the bar travel upward to full arm extension, keeping control and tension through the lats.\n\nKey points:\n- Keep wrists neutral and elbows tracking close to your torso for the underhand pattern.\n- Do not lean too far back or turn it into a row.\n- Full stretch at the top and controlled tempo improve lat recruitment.',
  },
  [normalizeExerciseName('Seated Cable Row (V-bar)')]: {
    muscles: 'Mid-back, lats, rear delts, biceps',
    technique:
      '1. Setup\nSit at the cable row station with your feet on the foot pads, knees slightly bent. Attach a V-bar handle.\n2. Starting Position\nArms extended forward, holding the handle. Torso upright, spine neutral.\n3. Row\nInitiate by pulling your shoulders down and back. Row the handle toward your lower ribs while keeping your elbows close to your body.\n4. Peak Contraction\nSqueeze your shoulder blades together at the end of the pull. Hold for 1 second.\n5. Return\nSlowly extend your arms forward without rounding your back.\n\nKey points:\n- V-bar grip emphasizes the lats and mid-back while allowing a strong neutral hand position.\n- Keep your torso upright — do not lean back to complete the row.\n- The return (eccentric) phase should be slow and controlled; feel the stretch in your lats.',
  },
  [normalizeExerciseName('T-Bar Row')]: {
    muscles: 'Mid-back, lats, rear delts, biceps',
    technique:
      '1. Setup\nStraddle the T-bar or landmine bar. Hinge forward at the hips to about 45 degrees. Grip the handle with both hands.\n2. Starting Position\nSpine neutral, core braced, knees slightly bent. If a chest pad is available, press into it.\n3. Row\nPull the handle toward your lower chest by driving your elbows back. Squeeze shoulder blades together.\n4. Top Position\nPause briefly at peak contraction. Keep your back angle constant.\n5. Lower\nSlowly lower the weight back to the starting position under control.\n\nKey points:\n- The T-bar row allows heavy loads with less balance demand than a barbell row.\n- Keep your back flat — any rounding means the weight is too heavy.\n- A chest-supported version removes lower-back stress entirely.',
  },
  [normalizeExerciseName('Abduction Machine / Abductors')]: {
    muscles: 'Glute medius, glute minimus',
    technique:
      '1. Setup\nSit in the machine with your back against the pad. Place the outsides of your knees or thighs against the pads.\n2. Starting Position\nFeet flat, hips supported, posture upright or slightly leaned forward.\n3. Push Out\nPush your knees outward against the pads in a controlled arc. Squeeze your outer glutes.\n4. End Range\nPause at the widest position without shifting your torso. Hold for 1 second.\n5. Return\nSlowly bring your knees back to the starting position, resisting the weight.\n\nKey points:\n- Leaning slightly forward increases glute medius activation.\n- Keep constant tension on the glutes — do not let the weight stack rest between reps.\n- A slow, controlled tempo is more effective than heavy, jerky reps.',
  },
  [normalizeExerciseName('Adduction Machine / Adductors')]: {
    muscles: 'Hip adductors (inner thighs)',
    technique:
      '1. Setup\nSit in the machine with your back against the pad. Place the insides of your knees or thighs against the pads, legs spread apart.\n2. Starting Position\nPosture upright, pelvis neutral, feet flat on the supports.\n3. Squeeze\nBring your legs together by squeezing your inner thighs (adductors). Control the motion throughout.\n4. Peak Contraction\nPause briefly when your legs come together. Squeeze your adductors for 1 second.\n5. Return\nSlowly open your legs back to the starting position, resisting the weight.\n\nKey points:\n- Focus on a controlled squeeze — avoid using momentum or rocking your torso.\n- Keep your posture upright; do not lean forward to help close the pads.\n- Inner thigh strength supports knee stability and helps prevent injuries.',
  },
  [normalizeExerciseName('Assisted Pull-ups (machine)')]: {
    muscles: 'Lats, upper back, biceps',
    technique:
      '1. Setup\nSet the assistance weight on the machine (more weight = easier). Step or kneel onto the pad and grip the handles.\n2. Starting Position\nHang with arms fully extended, shoulders active (pulled down and back). Core braced.\n3. Pull\nPull yourself upward by driving your elbows down. Focus on using your lats, not just your arms.\n4. Top Position\nPull until your chin clears the handles. Squeeze your lats at the top.\n5. Lower\nSlowly lower yourself back to full extension under control.\n\nKey points:\n- Gradually reduce the assistance weight over time to build toward unassisted pull-ups.\n- Focus on perfect form: full extension at the bottom, chin above handles at the top.\n- The machine mimics a true pull-up — use it to practice proper pulling mechanics.',
  },
  [normalizeExerciseName('Back Extensions (Hyperextensions)')]: {
    muscles: 'Lower back, glutes, hamstrings',
    technique:
      '1. Setup\nPosition your hips on the pad so your upper body can freely hinge forward. Lock your feet under the foot supports.\n2. Starting Position\nCross arms over your chest or place hands behind your head. Spine neutral.\n3. Lower\nHinge at the hips to lower your torso toward the floor in a controlled motion. Do not round your back.\n4. Raise\nLift your torso back up to a straight line by contracting your glutes and lower back. Do not hyperextend past neutral.\n5. Repeat\nMaintain a controlled tempo throughout. Inhale on the way down, exhale on the way up.\n\nKey points:\n- Stop at neutral (body in a flat line) — do not hyperextend your lower back past that point.\n- Squeeze your glutes at the top to share the load with your lower back.\n- Hold a weight plate against your chest to increase difficulty.',
  },
  [normalizeExerciseName('Barbell Hip Thrust')]: {
    muscles: 'Glutes, hamstrings',
    technique:
      '1. Setup\nSit on the floor with your upper back against a bench. Roll a barbell over your hips. Use a bar pad for comfort.\n2. Starting Position\nShoulder blades on the bench edge, knees bent, feet flat and about hip-width apart. Bar resting on your hip crease.\n3. Thrust\nDrive through your heels to lift your hips until your torso is parallel to the floor.\n4. Top Position\nSqueeze your glutes as hard as possible at the top for 2 seconds. Tuck your chin slightly.\n5. Lower\nSlowly lower your hips back toward the floor under control.\n\nKey points:\n- Use a posterior pelvic tilt (tuck your tailbone) at the top for maximum glute activation.\n- Your shins should be roughly vertical at the top of the movement.\n- The hip thrust is the single best exercise for glute development — prioritize the squeeze over heavy weight.',
  },
  [normalizeExerciseName('Barbell Row (underhand grip)')]: {
    muscles: 'Lats, mid-back, biceps',
    technique:
      '1. Setup\nStand with feet shoulder-width apart, hinge forward at the hips. Grip the bar with an underhand (supinated) grip, about shoulder-width.\n2. Starting Position\nBar at arm\'s length, spine neutral, core braced, knees slightly bent.\n3. Row\nPull the bar toward your lower abdomen by driving your elbows straight back. Squeeze your lats.\n4. Top Position\nPause with the bar at your lower abs. Feel the lat contraction.\n5. Lower\nSlowly lower the bar to full extension.\n\nKey points:\n- Underhand grip targets the lats and biceps more than an overhand grip.\n- Keep elbows close to your body, pulling toward your belly button.\n- Maintain a consistent hip hinge angle; do not stand up during the row.',
  },
  [normalizeExerciseName('Bent-Over Barbell Row')]: {
    muscles: 'Mid-back, lats, rear delts, biceps, core stabilizers',
    technique:
      '1. Setup\nStand with your feet hip-width apart. Grip the barbell slightly wider than shoulder-width.\n2. Starting Position\nHinge forward by pushing your hips back. Keep your back flat and core engaged. The bar hangs under your shoulders. Knees slightly bent.\n3. Movement\nPull the bar toward your lower ribs by driving your elbows back. Keep the bar close to your body.\n4. Top Position\nBring the bar close to your torso, squeeze your shoulder blades, and hold for 1 second.\n5. Return\nSlowly lower the bar back down to full arm extension with control.\n6. Breathing\nExhale as you pull, inhale as you lower.\n\nKey points:\n- Keep a neutral spine and do not round your back.\n- Drive your elbows back, not upward.\n- Keep the bar close to your body throughout the set.\n- Avoid using momentum and stay controlled.',
  },
  [normalizeExerciseName('Cable Crunch')]: {
    muscles: 'Rectus abdominis',
    technique:
      '1. Setup\nKneel below a cable machine with a rope attachment on the high pulley. Hold the rope ends near your temples.\n2. Starting Position\nKneel about 2 feet from the machine, torso upright, rope held firmly at your head.\n3. Crunch\nFlex your spine to crunch downward, bringing your elbows toward your thighs. Keep your hips stationary.\n4. Bottom Position\nSqueeze your abs hard at the bottom. Exhale fully through the contraction.\n5. Return\nSlowly return to the upright position, resisting the cable weight.\n\nKey points:\n- The movement is spine flexion — your hips stay still; do not sit back onto your heels.\n- Keep the rope at your head throughout; do not pull with your arms.\n- Exhale as you crunch for maximum ab activation.',
  },
  [normalizeExerciseName('Cable Kickback')]: {
    muscles: 'Glutes',
    technique:
      '1. Setup\nAttach an ankle strap to the low pulley. Secure it around one ankle and face the machine.\n2. Starting Position\nHold onto the machine for support with both hands. Stand on the non-working leg with a slight lean forward.\n3. Kick Back\nExtend the working leg backward by driving through the hip. Keep your pelvis stable and do not arch your lower back.\n4. Top Position\nSqueeze your glute at full extension for 1-2 seconds. Hold the contraction.\n5. Return\nSlowly bring the leg back to the starting position, resisting the cable pull.\n\nKey points:\n- Keep hips square and facing forward — do not rotate your pelvis.\n- The movement comes from the hip, not the lower back.\n- Use moderate weight; heavy weight often leads to compensatory lower back arching.',
  },
  [normalizeExerciseName('Standing Cable Kickback')]: {
    muscles: 'Glutes',
    technique:
      '1. Setup\nAttach an ankle strap to the low pulley. Secure it around your ankle. Stand facing the machine and hold onto a support, with a slight forward lean.\n2. Body Position\nKeep your back straight, core engaged, and hips square (do not rotate your pelvis during the movement).\n3. Starting Position\nYour working leg is slightly bent at the knee and positioned just behind your standing leg.\n4. Execution\nDrive the leg back using your glute, not your lower back. Keep the movement controlled and avoid swinging or using momentum.\n5. Peak and Return\nPause for 1 to 2 seconds at the top, squeezing your glute hard. Then slowly return to the starting position without dropping the weight.\n\nKey points:\n- Keep hips square and facing the machine — any pelvic rotation means the glute is not doing the work.\n- The movement is a hip extension, not a lower-back arch; think of pushing your heel behind you.\n- Use moderate weight for strict form — heavy loads lead to compensatory swinging.',
  },
  [normalizeExerciseName('Cable Step-ups')]: {
    muscles: 'Glutes, quads',
    technique:
      '1. Setup\nSet a cable to the low pulley with a rope or bar handle. Stand facing the machine with a step platform behind you.\n2. Starting Position\nHold the cable handle at your chest or waist, tension on the cable. One foot on the platform behind you.\n3. Step Up\nDrive through the front heel to step up onto the platform. Stand fully tall at the top.\n4. Top Position\nSqueeze your glutes at the top with hips fully extended.\n5. Step Down\nSlowly lower yourself back to the starting position. Complete all reps, then switch legs.\n\nKey points:\n- The cable adds resistance that challenges the glutes and quads throughout the range.\n- Drive through the heel of the stepping leg, not the toes.\n- Keep your torso upright — do not lean forward excessively.',
  },
  [normalizeExerciseName('Calf Jumps (on toes)')]: {
    muscles: 'Calves, foot stabilizers',
    technique:
      '1. Setup\nStand tall with feet hip-width apart, up on your toes/forefoot. Knees slightly soft.\n2. Starting Position\nWeight on the balls of your feet, core engaged, arms at your sides.\n3. Jump\nPerform quick, small jumps using only your calf muscles. Barely leave the ground.\n4. Landing\nLand softly on your forefoot each time. Maintain an upright posture.\n5. Rhythm\nKeep a consistent, rapid rhythm throughout the set.\n\nKey points:\n- These are low-amplitude jumps — you should barely leave the floor.\n- Stay on the balls of your feet; heels never touch the ground.\n- Great for calf endurance and ankle stability.',
  },
  [normalizeExerciseName('Cat Plank / Knee-to-chest plank')]: {
    muscles: 'Core, hip flexors, shoulders',
    technique:
      '1. Setup\nGet into a high plank position: hands under shoulders, body in a straight line, core braced.\n2. Starting Position\nArms extended, core tight, neutral spine.\n3. Knee Drive\nDraw one knee toward your chest while keeping your hips level and back flat.\n4. Return and Alternate\nExtend the leg back to plank, then repeat with the opposite leg.\n5. Maintain Stability\nKeep your torso rigid and hips square throughout. Avoid rocking or swaying.\n\nKey points:\n- Unlike mountain climbers, this is a slow, controlled exercise — focus on form.\n- Keep hips level; do not pike up or let them sag when the knee comes forward.\n- Great for core stability and hip flexor engagement.',
  },
  [normalizeExerciseName('Chest-supported Dumbbell Row')]: {
    muscles: 'Mid-back, lats, rear delts',
    technique:
      '1. Setup\nSet an incline bench to about 30-45 degrees. Lie face-down with your chest against the pad, dumbbells hanging below.\n2. Starting Position\nArms fully extended, palms facing each other. Chest supported by the bench.\n3. Row\nPull both dumbbells upward by driving your elbows back toward your hips. Squeeze shoulder blades together.\n4. Top Position\nPause at the top with shoulder blades pinched. Hold for 1 second.\n5. Lower\nSlowly lower the dumbbells to full arm extension.\n\nKey points:\n- Chest support eliminates momentum and lower back strain — pure back work.\n- Great exercise for those with lower back issues who cannot do bent-over rows.\n- Keep chest pressed into the bench throughout.',
  },
  [normalizeExerciseName('Curtsy Lunges with dumbbells')]: {
    muscles: 'Glutes, quads, adductors',
    technique:
      '1. Setup\nStand upright holding dumbbells at your sides. Feet hip-width apart.\n2. Starting Position\nCore braced, chest up, shoulders back.\n3. Curtsy Step\nStep one leg diagonally behind the other (like a curtsy) and lower into a lunge.\n4. Bottom Position\nBoth knees bent to about 90 degrees. Front knee tracking over the front toes. Keep torso upright.\n5. Return\nPush through the front heel to return to standing. Alternate sides.\n\nKey points:\n- The diagonal step targets the glute medius more than standard lunges.\n- Keep your torso upright throughout — do not lean to one side.\n- If balance is an issue, start without weights until the movement feels natural.',
  },
  [normalizeExerciseName('One-Arm Row')]: {
    muscles: 'Lats, mid-back, rear delts, biceps, core stabilizers',
    technique:
      '1. Setup\nPlace one hand and knee on a bench for support. Hold a dumbbell in the opposite hand with your arm extended straight down.\n2. Starting Position\nKeep your spine neutral, chest open, and core braced. Shoulder of the working arm stays packed down.\n3. Row\nDrive your elbow up and back, pulling the dumbbell toward your hip while keeping your torso stable.\n4. Peak Contraction\nPause for 1 second at the top and squeeze your lat and mid-back without shrugging.\n5. Lower\nLower the dumbbell under control to full arm extension, then repeat before switching sides.\n\nKey points:\n- Keep your hips and torso square; avoid twisting to lift heavier weight.\n- Pull with elbow path toward the hip for stronger lat emphasis.\n- Use controlled tempo on both up and down phases for better muscle activation.',
  },
  [normalizeExerciseName('Hack Squat')]: {
    muscles: 'Quadriceps, glutes',
    technique:
      '1. Setup\nPosition yourself on the hack squat machine with your back against the pad and shoulders under the shoulder pads. Feet shoulder-width apart on the platform.\n2. Starting Position\nUnlock the safety handles. Core braced, chest up, toes slightly pointed outward.\n3. Descent\nBend your knees and lower the sled until your thighs are at least parallel to the platform. Keep knees aligned with your toes.\n4. Bottom Position\nMaintain your weight on heels and mid-foot. Do not let your back round or knees cave inward.\n5. Stand Up\nPush through your heels to extend your hips and knees together. Squeeze your glutes at the top.\n\nKey points:\n- The fixed back support lets you focus on your quads without worrying about balance.\n- Foot placement changes emphasis: lower feet = more quads, higher feet = more glutes.\n- Do not bounce out of the bottom position; use a controlled reversal.',
  },
  [normalizeExerciseName('Hack RDL')]: {
    muscles: 'Hamstrings, glutes, lower back',
    technique:
      '1. Setup\nStand on the hack squat platform facing inward (reverse position), feet shoulder-width apart. Shoulders under the pads.\n2. Starting Position\nStand upright with spine neutral and core braced. Slight bend in the knees, locked in position throughout.\n3. Hinge\nPush your hips backward while the sled moves with you. Keep your spine neutral and the weight close to your body.\n4. Bottom Position\nLower until you feel a strong stretch in your hamstrings (usually around mid-shin level). Do not round your back.\n5. Return\nDrive your hips forward by contracting your glutes and hamstrings to return to standing. Avoid overextending your lower back at the top.\n\nKey points:\n- The hack machine provides guided movement, making this safer than a free-weight RDL.\n- Keep the knee bend constant — this is a hip hinge, not a squat.\n- Focus on feeling the hamstring stretch; go only as deep as your flexibility allows.',
  },
  [normalizeExerciseName('Hip Thrust / Glute Bridge')]: {
    muscles: 'Glutes, hamstrings',
    technique:
      '1. Setup\nSit with your upper back against a bench. Roll a barbell over your hips (or use bodyweight). Feet flat on floor, hip-width apart.\n2. Starting Position\nShoulder blades on the bench edge, knees bent, feet about shin-length from your glutes.\n3. Thrust\nDrive through your heels to lift your hips until your torso is parallel to the floor.\n4. Top Position\nSqueeze your glutes as hard as possible at the top for 2 seconds. Keep chin slightly tucked.\n5. Lower\nSlowly lower your hips back toward the floor with control.\n\nKey points:\n- Posterior pelvic tilt at the top (tuck tailbone) maximizes glute activation.\n- Keep chin tucked to maintain proper pelvic alignment.\n- This is the single best glute exercise — prioritize proper form over heavy weight.',
  },
  [normalizeExerciseName('Horizontal Leg Press')]: {
    muscles: 'Quadriceps, glutes, hamstrings',
    technique:
      '1. Setup\nSit in the machine with your back fully supported against the pad. Place feet shoulder-width apart on the platform.\n2. Starting Position\nUnlock the safety handles. Legs extended with a slight bend in the knees (do not lock out).\n3. Lower\nBend your knees to lower the platform toward you. Lower until knees reach about 90 degrees.\n4. Press\nPush the platform away by extending your legs. Drive through heels and mid-foot.\n5. Top Position\nExtend to near-full extension without locking out the knees.\n\nKey points:\n- Keep your lower back pressed into the pad throughout — if it lifts, you are going too deep.\n- Do not lock your knees at the top; keep a slight bend.\n- Foot placement changes emphasis: high = more glutes/hamstrings; low = more quads.',
  },
  [normalizeExerciseName('Leg Curl')]: {
    muscles: 'Hamstrings',
    technique:
      '1. Setup\nLie face-down or sit in the leg curl machine. Adjust the pad so it rests just above your ankles/Achilles tendon.\n2. Starting Position\nLegs extended, hips pressed firmly into the pad/seat, grip the handles for stability.\n3. Curl\nCurl your heels toward your glutes by flexing at the knees. Keep hips pressed down.\n4. Top Position\nSqueeze your hamstrings at peak contraction for 1-2 seconds.\n5. Lower\nSlowly extend your legs back to the starting position. Maintain tension throughout.\n\nKey points:\n- Keep hips pressed into the machine — lifting your hips reduces hamstring work.\n- Control the eccentric (lowering) phase; do not let gravity drop the weight.\n- Point toes slightly upward to increase hamstring involvement.',
  },
  [normalizeExerciseName('Leg Curl Lying')]: {
    muscles: 'Hamstrings',
    technique:
      '1. Setup\nLie face-down on the machine with the pad positioned just above your ankles. Grip the handles.\n2. Starting Position\nLegs fully extended, hips pressed firmly into the bench.\n3. Curl\nCurl your heels toward your glutes. Keep hips pressed into the bench throughout.\n4. Top Position\nSqueeze your hamstrings at peak contraction. Hold for 1-2 seconds.\n5. Lower\nSlowly lower the weight back to full extension.\n\nKey points:\n- Keep hips pinned to the bench — if they rise, lower the weight.\n- The lying position provides a greater hamstring stretch at the bottom.\n- Control the eccentric phase for maximum hamstring tension.',
  },
  [normalizeExerciseName('Leg Curl Sitting')]: {
    muscles: 'Hamstrings',
    technique:
      '1. Setup\nSit in the machine with your back against the pad. Adjust so your knees align with the machine\'s rotation axis.\n2. Starting Position\nLegs extended, thigh pad secured over your thighs, pad resting on the back of your lower legs.\n3. Curl\nFlex your knees to pull the pad down and behind you. Keep your torso stable.\n4. Top Position\nSqueeze your hamstrings at full contraction for 1-2 seconds.\n5. Return\nSlowly extend your legs back to the starting position.\n\nKey points:\n- Seated position allows for heavier loads since you are more stable.\n- Keep your torso still — do not rock forward as you curl.\n- Adjust the starting position so you feel tension from the very first rep.',
  },
  [normalizeExerciseName('Leg Extension Machine')]: {
    muscles: 'Quadriceps',
    technique:
      '1. Setup\nSit in the machine with your back against the pad. Adjust so your knees align with the machine\'s pivot point.\n2. Starting Position\nFeet under the roller pad on your lower shins. Grip the side handles.\n3. Extension\nExtend your knees to lift the pad upward, squeezing your quads through the full range.\n4. Top Position\nPause at near-full extension for 1-2 seconds. Squeeze hard. Avoid aggressive lockout.\n5. Lower\nSlowly lower the pad back to the starting position.\n\nKey points:\n- Proper knee alignment with the pivot point protects the joint.\n- Focus on the squeeze at the top for maximum quadriceps activation.\n- Use a slow and controlled tempo for both lifting and lowering.',
  },
  [normalizeExerciseName('Single-Leg Leg Extension')]: {
    muscles: 'Quadriceps',
    technique:
      '1. Setup\nSit in the machine with your back fully against the pad. Adjust so your knee aligns with the machine pivot. Place the roller above the foot of your working leg on the lower shin.\n2. Starting Position\nOne leg works, the other rests. Working knee bent at about 90 degrees. Hips stable on the seat.\n3. Extend\nExtend the working leg by contracting your quad. Raise the pad to near-full extension, pausing for 1-2 seconds at the top.\n4. Lower\nSlowly lower the pad back to the starting position under control. Do not drop the weight.\n5. Complete and Switch\nFinish all reps on one leg, then switch to the other.\n\nKey points:\n- Single-leg work exposes and corrects strength imbalances between legs.\n- Keep hips stable on the seat; do not lift your hip to help complete the rep.\n- Use moderate load with strict form — no explosive lockout or momentum.',
  },
  [normalizeExerciseName('Lunges')]: {
    muscles: 'Glutes, quadriceps, adductors',
    technique:
      '1. Setup\nStand upright with feet hip-width apart, holding dumbbells at your sides or with bodyweight only.\n2. Starting Position\nCore braced, chest up, shoulders back.\n3. Step and Lower\nStep forward or backward into a lunge. Bend both knees to about 90 degrees.\n4. Bottom Position\nFront shin mostly vertical, back knee just above the floor, torso upright.\n5. Return\nPush through the front heel to return to the starting position. Alternate sides.\n\nKey points:\n- Keep your torso upright throughout — do not lean forward.\n- Front knee should track over your toes, not cave inward.\n- Reverse lunges are generally easier on the knees than forward lunges.',
  },
  [normalizeExerciseName('Machine Crunch')]: {
    muscles: 'Rectus abdominis',
    technique:
      '1. Setup\nSit in the machine and adjust the seat and pad position so the rotation axis aligns with your mid-torso.\n2. Starting Position\nGrip the handles or place arms on the pads. Core engaged, back against the seat.\n3. Crunch\nFlex your spine to crunch forward/downward. Focus on contracting your abs, not pulling with your arms.\n4. Bottom Position\nSqueeze your abs at full contraction for 1 second. Exhale through the crunch.\n5. Return\nSlowly return to the starting position, resisting the weight throughout.\n\nKey points:\n- The machine guides the movement, making it safe for heavy ab training.\n- Focus on spine flexion, not hip flexion — the movement should come from your core.\n- Do not use your arms to pull the weight; your abs do the work.',
  },
  [normalizeExerciseName('Machine Hip Thrust')]: {
    muscles: 'Glutes, hamstrings',
    technique:
      '1. Setup\nSit in the hip thrust machine. Adjust the back pad and foot position as needed. Secure the hip pad.\n2. Starting Position\nFeet flat on the platform, shoulder blades against the back pad, hip pad positioned across your hips.\n3. Thrust\nDrive through your heels to extend your hips upward until torso is parallel to the floor.\n4. Top Position\nSqueeze your glutes hard at the top for 2 seconds. Keep chin slightly tucked and ribs down.\n5. Lower\nSlowly lower your hips back to the starting position.\n\nKey points:\n- The machine provides a safe, stable environment for heavy hip thrusts.\n- Focus on the glute squeeze at the top, not on moving heavy weight.\n- Keep a posterior pelvic tilt at the top for maximum glute activation.',
  },
  [normalizeExerciseName('Machine Row')]: {
    muscles: 'Mid-back, lats, rear delts',
    technique:
      '1. Setup\nSit in the machine with your chest against the pad (if available). Adjust the seat so the handles are at mid-torso height.\n2. Starting Position\nGrip the handles with arms extended. Chest pressed into the pad, back straight.\n3. Row\nPull the handles toward your torso by driving elbows backward. Squeeze shoulder blades together.\n4. Top Position\nHold the contraction for 1 second with shoulder blades pinched.\n5. Return\nSlowly extend your arms back to the starting position.\n\nKey points:\n- Chest support eliminates momentum — pure back isolation.\n- Pull with your back, not your biceps; think about driving your elbows back.\n- Keep shoulders down away from ears throughout the movement.',
  },
  [normalizeExerciseName('Seated Machine Row (Hammer Strength)')]: {
    muscles: 'Mid-back, lats, rear delts, rhomboids',
    technique:
      '1. Setup\nSit on the Hammer Strength row machine and adjust seat height so handles line up with mid-lower chest. Place feet firmly and chest against the pad.\n2. Starting Position\nGrip the handles with neutral or slightly pronated grip, arms almost fully extended, shoulders packed down, core braced.\n3. Row\nDrive elbows back and slightly down, pulling handles toward your torso. Keep chest in contact with the pad and avoid shrugging.\n4. Peak Contraction\nPause for 1 second at full contraction, squeezing shoulder blades together without leaning or jerking.\n5. Controlled Return\nSlowly let the handles travel forward to a full stretch under control, then repeat.\n\nKey points:\n- Let your shoulder blades protract on the way forward and retract on the way back for full range.\n- Keep your torso fixed against the pad so the back does the work, not momentum.\n- Drive with elbows, not hands, to reduce biceps takeover and target the back more.',
  },
  [normalizeExerciseName('Pull-ups')]: {
    muscles: 'Lats, upper back, biceps',
    technique:
      '1. Setup\nGrip the bar with an overhand grip, slightly wider than shoulder-width. Hang with arms fully extended.\n2. Starting Position\nActive hang: depress your shoulder blades and engage your core.\n3. Pull\nPull yourself up by driving your elbows down. Focus on using your lats.\n4. Top Position\nPull until your chin clears the bar. Squeeze your lats at the top.\n5. Lower\nSlowly lower yourself back to a full dead hang.\n\nKey points:\n- Start from a dead hang with active (depressed) shoulders on every rep.\n- drive your elbows down, not your hands up — this engages the lats more.\n- Avoid kipping or swinging; strict reps build more strength.',
  },
  [normalizeExerciseName('Close-Grip Pull-Ups')]: {
    muscles: 'Lats, biceps, mid back, forearms',
    technique:
      '1. Setup\nGrab the bar with a narrow grip (closer than shoulder-width), palms facing away or neutral.\n2. Starting Position\nHang with arms fully extended. Core engaged, shoulders down.\n3. Movement\nPull your body up by driving your elbows down and back.\n4. Top Position\nPull until your chin is above the bar. Squeeze your shoulder blades and hold for 1 second.\n5. Return\nSlowly lower yourself back to full arm extension.\n6. Breathing\nExhale as you pull, inhale as you lower.\n\nKey points:\n- Narrow grip increases biceps and lower lat involvement.\n- Avoid swinging and stay controlled.\n- Use full range of motion.\n- Keep shoulders down and away from your ears.',
  },
  [normalizeExerciseName('Neutral-Grip Pull-Ups')]: {
    muscles: 'Lats, biceps, mid back, forearms',
    technique:
      '1. Setup\nGrab the parallel handles (palms facing each other).\n2. Starting Position\nHang with arms fully extended. Core engaged, shoulders down.\n3. Movement\nPull your body up by driving your elbows down and back.\n4. Top Position\nPull until your chin is above the handles. Squeeze your shoulder blades and hold for 1 second.\n5. Return\nSlowly lower yourself back to full arm extension.\n6. Breathing\nExhale as you pull, inhale as you lower.\n\nKey points:\n- Neutral grip is more shoulder-friendly.\n- Balanced activation of back and arms.\n- Stay controlled and no swinging.\n- Use full range of motion.',
  },
  [normalizeExerciseName('Rack Pulls')]: {
    muscles: 'Glutes, hamstrings, spinal erectors, traps',
    technique:
      '1. Setup\nSet the barbell on rack pins at about knee height (or slightly above/below). Stand with feet hip-width apart.\n2. Starting Position\nGrip the bar just outside your legs, overhand or mixed grip. Brace your core and engage your lats.\n3. Pull\nExtend your hips and knees to stand upright, pulling the bar along your thighs.\n4. Top Position\nStand fully tall with shoulders back. Squeeze glutes at the top.\n5. Lower\nHinge at the hips and lower the bar back to the rack pins under control.\n\nKey points:\n- Rack pulls are a partial deadlift that allows heavier loading for the top portion of the lift.\n- Keep the bar close to your body throughout the pull.\n- Great for building hip lockout strength and upper back/trap mass.',
  },
  [normalizeExerciseName('Seated Cable Row (wide grip)')]: {
    muscles: 'Mid-back, rear delts, rhomboids',
    technique:
      '1. Setup\nSit at the cable row station. Attach a wide grip bar. Feet on the foot pads, knees slightly bent.\n2. Starting Position\nArms extended forward, holding the bar with a wide overhand grip. Torso upright, back straight.\n3. Row\nPull the bar toward your upper abdomen, driving elbows outward and back. Squeeze shoulder blades.\n4. Top Position\nHold the contraction for 1 second with elbows high and back pinched.\n5. Return\nSlowly extend arms to the starting position without rounding your back.\n\nKey points:\n- Wide grip + high elbows targets the upper back and rear delts more.\n- Keep your torso upright; do not lean back to complete the row.\n- Great for building upper back thickness.',
  },
  [normalizeExerciseName('Seated Calf Raises (machine)')]: {
    muscles: 'Soleus, gastrocnemius',
    technique:
      '1. Setup\nSit in the calf raise machine with your forefoot on the platform. Secure pads over your thighs/knees.\n2. Starting Position\nLower your heels below the platform to feel a full stretch in your calves.\n3. Raise\nPush through the balls of your feet to raise your heels as high as possible.\n4. Top Position\nSqueeze your calves at the top for 1-2 seconds.\n5. Lower\nSlowly lower your heels back to the stretched position.\n\nKey points:\n- Seated position targets the soleus more (deeper calf muscle) compared to standing calf raises.\n- Full range of motion is critical: stretch at bottom, squeeze at top.\n- Use a slow tempo; calves respond well to time under tension.',
  },
  [normalizeExerciseName('Single-leg Calf Raises with dumbbell')]: {
    muscles: 'Gastrocnemius, soleus',
    technique:
      '1. Setup\nStand on one foot on the edge of a step or platform, holding a dumbbell in the same-side hand. Hold onto something for balance.\n2. Starting Position\nLower your heel below the platform to get a full calf stretch. Other foot is off the ground.\n3. Raise\nPush through the ball of your foot to raise up onto your toes as high as possible.\n4. Top Position\nSqueeze your calf at the top for 1-2 seconds.\n5. Lower\nSlowly lower your heel back below the platform. Complete all reps, then switch legs.\n\nKey points:\n- Single-leg work corrects strength imbalances between calves.\n- Full range of motion is key: deep stretch at bottom, full squeeze at top.\n- Hold onto something stable for balance so you can focus on the calf work.',
  },
  [normalizeExerciseName('Smith Machine Deadlift')]: {
    muscles: 'Glutes, hamstrings, spinal erectors',
    technique:
      '1. Setup\nStand with feet hip-width apart inside the Smith machine, bar over mid-foot.\n2. Starting Position\nHinge at the hips to grip the bar, core braced, back flat, shoulders over the bar.\n3. Pull\nExtend hips and knees together to stand up, keeping the bar close to your body.\n4. Top Position\nStand fully upright. Squeeze glutes. Shoulders back.\n5. Lower\nHinge at the hips first, then bend knees once the bar passes them. Lower with control.\n\nKey points:\n- The Smith machine guides the bar path, making this safer for solo training.\n- Keep your spine neutral throughout; the guided path does not prevent poor form.\n- Great for those learning the deadlift pattern or training without a spotter.',
  },
  [normalizeExerciseName('Smith Machine Row')]: {
    muscles: 'Mid-back, lats, rear delts',
    technique:
      '1. Setup\nStand over the Smith bar with feet shoulder-width apart. Hinge forward at the hips to about 45 degrees.\n2. Starting Position\nGrip the bar overhand or underhand. Bar hanging at arm\'s length, back flat, core braced.\n3. Row\nPull the bar toward your lower chest/upper abs by driving elbows back. Squeeze shoulder blades.\n4. Top Position\nHold contraction for 1 second at your torso. Keep back angle constant.\n5. Lower\nSlowly lower the bar to arm\'s length.\n\nKey points:\n- The Smith track guides the bar, allowing you to focus on the squeeze.\n- Keep your back angle fixed; do not stand up during the row.\n- Great alternative when you want consistent bar path without balancing.',
  },
  [normalizeExerciseName('Smith Machine Shrugs')]: {
    muscles: 'Upper trapezius',
    technique:
      '1. Setup\nStand inside the Smith machine with the bar at thigh level. Grip the bar with an overhand grip, shoulder-width apart.\n2. Starting Position\nArms fully extended, shoulders down, core engaged.\n3. Shrug\nLift your shoulders straight up toward your ears as high as possible.\n4. Top Position\nSqueeze your traps at the top for 1-2 seconds.\n5. Lower\nSlowly lower your shoulders back to the starting position.\n\nKey points:\n- The Smith machine allows heavier loading since you do not need to balance the bar.\n- Move straight up and down — no rolling.\n- Use straps if grip limits your trap training.',
  },
  [normalizeExerciseName('Smith Machine/burbell Squat')]: {
    muscles: 'Quadriceps, glutes, adductors',
    technique:
      '1. Setup\nPosition yourself under the Smith machine bar so it rests on your upper back. Feet shoulder-width apart, slightly forward of the bar.\n2. Starting Position\nUnrack by rotating the bar hooks. Stand tall with core braced and chest up.\n3. Descent\nBend your knees and hips together to lower your body. Keep your back flat against the bar and knees tracking over toes.\n4. Bottom Position\nDescend to a controlled depth, at least to thighs parallel. Maintain core tension.\n5. Stand Up\nDrive through your feet to stand back up along the guided bar path.\n\nKey points:\n- The Smith machine guides the bar path, so you can focus on depth and leg drive.\n- Place feet slightly forward of the bar — this keeps the load on your quads and glutes.\n- Do not fully rely on the fixed path as a crutch; maintain proper squat mechanics.',
  },
  [normalizeExerciseName('Standing Calf Raises (machine / dumbbell)')]: {
    muscles: 'Gastrocnemius, soleus',
    technique:
      '1. Setup\nStand with the balls of your feet on the edge of a platform or calf raise machine. Hold dumbbells at your sides or position shoulder pads over your shoulders.\n2. Starting Position\nLower your heels below the platform to feel a full stretch in your calves. Keep your body upright.\n3. Raise\nRise onto your toes as high as possible by pushing through the balls of your feet.\n4. Top Position\nSqueeze your calves hard at the top for 1-2 seconds.\n5. Lower\nSlowly lower your heels back below the platform under control.\n\nKey points:\n- Full range of motion is essential: deep stretch at the bottom, full squeeze at the top.\n- The standing position targets the gastrocnemius (upper calf) more than seated raises.\n- Use a slow tempo — calves respond well to time under tension.',
  },
  [normalizeExerciseName('Step-ups onto platform with dumbbells')]: {
    muscles: 'Glutes, quadriceps, hamstrings',
    technique:
      '1. Setup\nStand facing a stable platform or bench. Hold dumbbells at your sides, arms fully extended.\n2. Starting Position\nPlace one foot firmly on the platform — entire foot, not just the toes.\n3. Step Up\nDrive through the heel of the leading foot to step onto the platform. Let the front leg do the work; do not push off with the trailing leg.\n4. Top Position\nStand fully tall on the platform. Keep pelvis level and torso upright.\n5. Step Down\nSlowly lower yourself back to the floor with control. Alternate sides each rep or complete all reps on one side.\n\nKey points:\n- Drive through the heel of the stepping leg — this maximizes glute activation.\n- Keep your torso upright and pelvis level; do not lean to one side.\n- A higher platform increases the range of motion and difficulty.',
  },
  [normalizeExerciseName('Stiff-Leg Deadlift')]: {
    muscles: 'Hamstrings, glutes, lower back',
    technique:
      '1. Setup\nStand tall with feet hip-width apart, holding a barbell or dumbbells in front of your thighs. Knees nearly straight with a very slight softness.\n2. Starting Position\nCore braced, back flat, shoulders down. The knees stay in this position throughout.\n3. Hinge\nHinge deeply at the hips, lowering the weight along your legs while keeping your back neutral and the weight close to your body.\n4. Bottom Position\nLower until you feel a strong hamstring stretch. Stop before your back rounds.\n5. Return\nExtend your hips to stand upright. Squeeze your glutes at the top.\n\nKey points:\n- Stiff-leg differs from RDL in that the knees stay nearly locked — this increases the hamstring stretch.\n- Keep the weight close to your legs throughout the movement.\n- Only go as deep as your hamstring flexibility allows — depth will improve over time.',
  },
  [normalizeExerciseName('Sumo Deadlift')]: {
    muscles: 'Glutes, adductors, hamstrings, quads',
    technique:
      '1. Setup\nTake a wide stance (1.5-2x shoulder-width) with toes pointed outward at about 30-45 degrees. The bar is over mid-foot.\n2. Starting Position\nDrop your hips, grip the bar inside your knees with an overhand or mixed grip. Chest up, core braced, back flat.\n3. Pull\nPush the floor away with your legs while keeping your chest up. Extend hips and knees together.\n4. Lockout\nStand fully tall with hips extended and shoulders back. Squeeze glutes at the top.\n5. Lower\nHinge at the hips and bend your knees to lower the bar with control.\n\nKey points:\n- The wide stance shifts emphasis to the glutes and adductors compared to a conventional deadlift.\n- Keep your chest up and back flat — the wider stance makes it easier to maintain an upright torso.\n- Push your knees outward throughout the lift; do not let them collapse inward.',
  },
  [normalizeExerciseName('Sumo Squat with dumbbell / barbell / Smith machine')]: {
    muscles: 'Glutes, adductors, quadriceps',
    technique:
      '1. Setup\nTake a wide stance (1.5-2x shoulder-width) with toes turned out at about 45 degrees. Hold a dumbbell, barbell, or use the Smith machine.\n2. Starting Position\nCore braced, chest up, weight distributed across your whole foot.\n3. Descent\nPush your hips down and back while driving your knees outward in the direction your toes point.\n4. Bottom Position\nLower until thighs are parallel to the floor or slightly below. Maintain an upright torso.\n5. Stand Up\nDrive through your heels and mid-foot to stand. Squeeze glutes at the top.\n\nKey points:\n- Push knees outward throughout the movement — collapsing inward reduces glute/adductor activation.\n- The wide stance targets the inner thighs and glutes more than a standard squat.\n- Keep your torso as upright as possible; do not lean forward.',
  },
  [normalizeExerciseName('TRX Rows')]: {
    muscles: 'Upper back, lats, rear delts, biceps',
    technique:
      '1. Setup\nGrip the TRX handles with an overhand grip. Lean back with arms extended and your body in a straight line from head to heels.\n2. Starting Position\nFeet forward (closer to anchor = harder). Body straight, core and glutes engaged, straps taut.\n3. Pull\nPull your chest toward the handles by driving your elbows back. Squeeze your shoulder blades together.\n4. Top Position\nPause at the top with your shoulder blades pinched. Hold for 1 second.\n5. Lower\nSlowly extend your arms to return to the leaned-back position under control.\n\nKey points:\n- Walk your feet closer to the anchor point to increase difficulty.\n- Keep your body rigid — do not let your hips sag or pike upward.\n- Great bodyweight pulling exercise that can be done anywhere with a TRX or suspension trainer.',
  },
  [normalizeExerciseName('Upright Row (barbell/dumbbell/cable)')]: {
    muscles: 'Upper traps, lateral delts',
    technique:
      '1. Setup\nStand tall holding a barbell, dumbbells, or cable handle in front of your thighs. Use a grip slightly narrower than shoulder-width.\n2. Starting Position\nArms extended, core engaged, shoulders down.\n3. Pull\nPull the weight upward along your body by leading with your elbows. Drive elbows up and out to the sides.\n4. Top Position\nStop when elbows reach about shoulder height (upper chest level). Do not pull higher to avoid shoulder impingement.\n5. Lower\nSlowly lower the weight back to the starting position with control.\n\nKey points:\n- Lead with your elbows, not your hands — this keeps the focus on delts and traps.\n- Do not pull higher than shoulder level; excessive height can cause shoulder impingement.\n- A wider grip shifts emphasis to the lateral delts; a narrower grip emphasizes the traps.',
  },
  [normalizeExerciseName('Vertical Leg Press')]: {
    muscles: 'Quadriceps, glutes, hamstrings',
    technique:
      '1. Setup\nLie into the vertical leg press machine with your back supported. Place your feet on the platform at hip-width.\n2. Starting Position\nUnlock the safety. Knees bent, platform above you. Lower back pressed into the pad.\n3. Movement\nPress the platform upward by extending your legs. Drive through your heels and midfoot.\n4. Top Position\nExtend your legs close to full extension without locking your knees.\n5. Return\nSlowly bend your knees and lower the platform with control.\n6. Breathing\nExhale as you press, inhale as you lower.\n\nKey points:\n- Keep your lower back pressed into the pad.\n- Do not lock your knees.\n- Control the depth to maintain hip position.\n- Foot placement shifts emphasis: higher = more glutes, lower = more quads. 💪',
  },
  [normalizeExerciseName('Woodchopper / Rotation Cable')]: {
    muscles: 'Obliques, transverse abdominis, shoulders',
    technique:
      '1. Setup\nSet the cable to a high or low position (high for downward chop, low for upward chop). Stand sideways to the machine in a staggered stance.\n2. Starting Position\nGrip the handle with both hands, arms extended toward the cable. Core engaged, feet firmly planted.\n3. Chop\nRotate your torso to pull the handle diagonally across your body. The power comes from your trunk rotation, not your arms.\n4. Finish\nExhale as you complete the rotation. Pause briefly at the end position.\n5. Return\nSlowly return to the starting position under control. Complete all reps, then switch sides.\n\nKey points:\n- The movement is driven by trunk rotation — your arms are just connecting your body to the cable.\n- Keep your hips relatively stable; most of the rotation should come from your torso.\n- High-to-low chops target the obliques differently than low-to-high chops — use both.',
  },
}

const musclesByZone: Record<string, string> = {
  'Legs / Glutes': 'Quadriceps, glutes, adductors',
  Hamstrings: 'Hamstrings, glutes, lower back',
  Calves: 'Gastrocnemius, soleus',
  Chest: 'Pectorals, anterior deltoid, triceps',
  Back: 'Latissimus dorsi, rhomboids, rear deltoid, biceps',
  Shoulders: 'Deltoids, upper trapezius',
  Arms: 'Biceps, triceps, forearms',
  'Core / Abs': 'Rectus abdominis, obliques, transverse abdominis',
  Cardio: 'Full body with emphasis on core and lower body',
}

const keywordMusclesMap: Array<{ keywords: string[]; muscles: string }> = [
  { keywords: ['squat', 'leg press', 'lunge', 'step up', 'hack squat', 'split squat'], muscles: 'Quadriceps, glutes, adductors' },
  { keywords: ['leg extension'], muscles: 'Quadriceps' },
  { keywords: ['deadlift', 'romanian', 'stiff leg', 'hamstring curl', 'nordic', 'good morning', 'hyperextension'], muscles: 'Hamstrings, glutes, lower back' },
  { keywords: ['leg curl'], muscles: 'Hamstrings' },
  { keywords: ['hip thrust', 'glute bridge', 'kickback', 'abduction', 'adduction', 'clamshell'], muscles: 'Glutes, hip abductors, adductors' },
  { keywords: ['calf'], muscles: 'Gastrocnemius, soleus' },
  { keywords: ['bench press', 'chest press', 'push up', 'fly', 'pec deck', 'dip'], muscles: 'Pectorals, anterior deltoid, triceps' },
  { keywords: ['row', 'pulldown', 'pull up', 'pullover'], muscles: 'Latissimus dorsi, rhomboids, rear deltoid, biceps' },
  { keywords: ['overhead press', 'arnold', 'lateral raise', 'front raise', 'rear delt', 'face pull', 'upright row'], muscles: 'Deltoids, upper trapezius' },
  { keywords: ['curl', 'triceps', 'pushdown', 'skull crusher', 'french press', 'close grip'], muscles: 'Biceps, triceps, forearms' },
  { keywords: ['crunch', 'plank', 'twist', 'woodchopper', 'leg raise', 'knee raise'], muscles: 'Rectus abdominis, obliques, transverse abdominis' },
  { keywords: ['burpee', 'mountain climber', 'jumping jack', 'high knees'], muscles: 'Full body with emphasis on core and lower body' },
]

const defaultTechniqueByTag: Record<BuilderExerciseTag, string> = {
  'Main exercise':
    '1. Setup\nSet a stable start position: feet firmly planted, spine neutral, and core braced before unracking or starting.\n2. Lowering Phase\nLower the weight with control while keeping your posture neutral and joints properly aligned.\n3. Driving Phase\nDrive through the working muscles to return to the start. Avoid jerking or relying on momentum.\n4. Breathing and Tempo\nKeep breathing steady — exhale on effort, inhale on the return. Use full range of motion every rep.\n5. Completion\nFinish each rep fully before starting the next. Maintain quality until the last rep.\n\nKey points:\n- Main exercises use heavy loads — proper bracing and form are critical for safety.\n- Prioritize full range of motion over heavy weight.\n- If form breaks, stop the set or lower the weight.',
  Accessory:
    '1. Setup\nChoose a moderate load and position your body so the target muscles are loaded from the start.\n2. Concentric Phase\nPerform the lifting phase smoothly without momentum. Focus on the muscle, not the weight.\n3. Peak Contraction\nPause briefly at the top to maximize muscle engagement.\n4. Eccentric Phase\nControl the lowering phase — keep tension on the target muscles the entire time.\n5. Consistency\nKeep tempo consistent across all reps. Avoid compensating with other muscles in the final reps.\n\nKey points:\n- Accessories support main lifts — use them to strengthen weak points.\n- Moderate weight with strict form is more effective than heavy swinging.\n- Focus on the mind-muscle connection throughout each set.',
  Isolation:
    '1. Setup\nFix your body position so only the target joint is free to move. Stabilize everything else.\n2. Lift\nLift with focus on the working muscle, not on the load. Move through the full range of motion.\n3. Peak Contraction\nPause briefly at peak contraction to improve the mind-muscle connection.\n4. Lower\nLower slowly and keep strict technique throughout the full set.\n5. Maintain Form\nDo not recruit other muscles to complete reps — if you cannot maintain isolation, reduce the weight.\n\nKey points:\n- Isolation exercises target one muscle — cheating defeats their purpose.\n- Use a slow, controlled tempo for maximum time under tension.\n- Light weight with perfect form beats heavy weight with bad form.',
  Cardio:
    '1. Start\nBegin at a sustainable pace with tall posture and controlled movement.\n2. Build Rhythm\nMaintain rhythmic breathing and smooth transitions between reps.\n3. Sustain\nKeep movement quality high even as fatigue increases. Focus on form, not speed.\n4. Adjust\nReduce speed slightly if your form starts to break, then continue with control.\n5. Finish\nComplete the set with clean reps — do not sacrifice form for a few extra reps.\n\nKey points:\n- Moving well matters more than moving fast — quality over quantity.\n- Soft landings protect your joints during high-impact movements.\n- Breathe rhythmically; holding your breath causes premature fatigue.',
  'Core exercise':
    '1. Setup\nBrace your core and set a neutral spine before starting.\n2. Movement\nMove with control using your abs and obliques. Avoid pulling with your neck or relying solely on hip flexors.\n3. Peak Contraction\nSqueeze your core at the hardest point of each rep. Exhale through the effort.\n4. Return\nReturn slowly to the start position, maintaining tension.\n5. Consistency\nKeep constant abdominal tension through the entire set.\n\nKey points:\n- Core exercises are about quality contractions, not fast reps.\n- Keep your lower back supported — if it arches, adjust the exercise difficulty.\n- Exhale during effort for maximum ab activation.',
}

const resolveMuscles = (exerciseName: string, zone?: string) => {
  const normalized = normalizeExerciseName(exerciseName)

  for (const entry of keywordMusclesMap) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.muscles
    }
  }

  return zone ? (musclesByZone[zone] ?? 'Primary target muscles of this exercise') : 'Primary target muscles of this exercise'
}

const resolveTechnique = (exerciseName: string, tag?: BuilderExerciseTag) => {
  const normalized = normalizeExerciseName(exerciseName)

  if (normalized.includes('hip thrust') || normalized.includes('glute bridge')) {
    return '1. Setup\nSet your upper back against a bench or pad. Plant feet flat on the floor at hip width, knees bent.\n2. Drive\nBrace your core and drive through your heels to lift your hips until your torso is parallel to the floor.\n3. Squeeze\nSqueeze your glutes hard at the top without overextending your lower back. Hold for 1-2 seconds.\n4. Lower\nSlowly lower your hips under control, keeping tension in your glutes.\n5. Repeat\nMaintain the same quality on every rep.\n\nKey points:\n- Use a posterior pelvic tilt (tuck tailbone) at the top for maximum glute activation.\n- Drive through your heels, not your toes.\n- This pattern is the gold standard for glute development.'
  }

  if (normalized.includes('kickback') || normalized.includes('abduction') || normalized.includes('adduction') || normalized.includes('clamshell')) {
    return '1. Setup\nStabilize your pelvis and core before moving the working leg.\n2. Execution\nMove through the hip joint only, keeping your torso still and avoiding rotation.\n3. Peak Contraction\nPause at peak contraction to feel glute or inner-thigh engagement. Hold for 1-2 seconds.\n4. Return\nLower or return the leg slowly, maintaining strict form.\n5. Complete\nKeep form consistent for all reps. Switch sides and repeat.\n\nKey points:\n- Isolate the hip joint — no torso rotation or lower back arching.\n- Light weight with strict form is more effective than heavy swinging.\n- Focus on feeling the target muscle work on every rep.'
  }

  if (normalized.includes('squat') || normalized.includes('lunge') || normalized.includes('leg press') || normalized.includes('step up')) {
    return '1. Setup\nPlace feet about shoulder-width apart with whole foot grounded. Core braced, chest up.\n2. Descent\nLower yourself by bending hips and knees together. Keep knees tracking over your toes.\n3. Bottom Position\nDescend to a controlled depth without losing your neutral spine.\n4. Drive Up\nPush through mid-foot and heels to stand up with control.\n5. Finish\nKeep chest up and avoid knee collapse inward throughout the movement.\n\nKey points:\n- Knees must track in the direction your toes point — never let them cave inward.\n- Depth depends on mobility — go as low as you can with good form.\n- Control the descent; do not drop into the bottom position.'
  }

  if (normalized.includes('leg extension')) {
    return '1. Setup\nAdjust the machine so your knees align with the rotation axis and your back stays supported against the pad.\n2. Starting Position\nFeet under the roller pad, hands gripping the side handles.\n3. Extension\nExtend your knees smoothly until quads are fully contracted.\n4. Top Position\nPause briefly at the top without locking your knees aggressively. Squeeze your quads for 1 second.\n5. Lower\nLower under control to maintain constant quadriceps tension.\n\nKey points:\n- Proper knee alignment with the machine pivot protects the joint.\n- Squeeze at the top — that is where the quads work the hardest.\n- Use a slow eccentric (lowering) phase for maximum muscle tension.'
  }

  if (normalized.includes('leg curl')) {
    return '1. Setup\nAdjust the pad so it rests comfortably just above your ankles. Press your hips into the bench or seat.\n2. Starting Position\nLegs extended, grip the handles for stability.\n3. Curl\nCurl your heels toward your glutes by flexing at the knees. Keep hips pressed down.\n4. Peak Contraction\nSqueeze your hamstrings at peak contraction for 1-2 seconds.\n5. Lower\nSlowly extend your legs back to the start. Do not let the weight stack drop.\n\nKey points:\n- Keep hips pressed into the machine — lifting them reduces hamstring work.\n- Control the eccentric (lowering) phase for maximum tension.\n- Point toes slightly upward to increase hamstring involvement.'
  }

  if (normalized.includes('deadlift') || normalized.includes('romanian') || normalized.includes('good morning')) {
    return '1. Setup\nStand with neutral spine, soft knees, and shoulders packed down. Core braced.\n2. Hinge\nHinge at the hips first while keeping the load close to your body. Maintain a flat back.\n3. Bottom Position\nLower until you feel hamstring tension without rounding your back.\n4. Drive\nDrive your hips forward to stand tall. Squeeze glutes at the top.\n5. Lower\nReverse the movement under control to return to the starting position.\n\nKey points:\n- The weight must stay close to your body throughout — this protects your lower back.\n- Hip hinge, not squat — the knees stay soft in the same position.\n- Stop descent when your back starts to round; that is your current limit.'
  }

  if (normalized.includes('row') || normalized.includes('pulldown') || normalized.includes('pull up')) {
    return '1. Setup\nSet your torso stable and keep your chest open. Position yourself for the pull.\n2. Initiate\nStart the pull by driving your elbows back, not by shrugging your shoulders.\n3. Pull\nPull to full contraction with a controlled tempo. Squeeze shoulder blades together.\n4. Peak Contraction\nHold the squeezed position for 1 second at the end of the pull.\n5. Return\nSlowly return the weight, keeping shoulder blades under control.\n\nKey points:\n- Think about pulling with your elbows, not your hands — this engages the back more.\n- Avoid excessive body swing or momentum.\n- Full range of motion: stretch at the bottom, full squeeze at the top.'
  }

  if (normalized.includes('fly') || normalized.includes('pec deck')) {
    return '1. Setup\nSet your shoulders down and back. Maintain a slight bend in your elbows, locked in place.\n2. Starting Position\nArms spread with tension on the chest. Back supported, core engaged.\n3. Close\nBring your arms together in a wide arc, focusing on squeezing your chest.\n4. Peak Contraction\nPause in the contracted position for 1 second. Do not shrug your shoulders.\n5. Open\nSlowly spread your arms back to a comfortable stretch under control.\n\nKey points:\n- The elbow angle stays fixed throughout — do not straighten or bend further.\n- Focus on the chest squeeze at the top, not on moving heavy weight.\n- Slow tempo maximizes time under tension and chest activation.'
  }

  if (normalized.includes('press') || normalized.includes('push up') || normalized.includes('dip')) {
    return '1. Setup\nSet shoulders down and back with stable core tension. Grip the weight or position your hands.\n2. Starting Position\nArms extended (or in the rack position). Core braced, body stable.\n3. Lowering Phase\nLower under control, keeping elbows in a safe path (typically 30-45 degrees from your torso).\n4. Press\nPress upward powerfully without bouncing from the bottom. Drive through your palms.\n5. Lockout\nFinish each rep with full extension, steady breathing, and maintained control.\n\nKey points:\n- Keep elbows in a safe path — flaring them too wide stresses the shoulders.\n- Control the descent; do not bounce the weight off your chest or out of the bottom.\n- Breathe: inhale on the way down, exhale on the press.'
  }

  if (normalized.includes('curl') || normalized.includes('triceps') || normalized.includes('pushdown') || normalized.includes('skull')) {
    return '1. Setup\nPosition yourself with elbows fixed and upper arm stable. Grip the weight.\n2. Starting Position\nArms in the starting position with tension already on the target muscle.\n3. Lift/Press\nMove only through the target joint — avoid any torso swing or body English.\n4. Peak Contraction\nSqueeze the target muscle hard at peak contraction for 1 second.\n5. Lower\nLower the weight slowly to keep tension on the muscle throughout.\n\nKey points:\n- Elbow position is everything — if they move, you are cheating.\n- Use a weight you can control strictly for the full set.\n- Arm exercises respond best to strict form and moderate weight.'
  }

  if (normalized.includes('raise') || normalized.includes('fly') || normalized.includes('face pull')) {
    return '1. Setup\nUse a light to moderate load. Set a stable shoulder position with shoulders down and back.\n2. Starting Position\nArms in position with a slight elbow bend, locked in place.\n3. Raise/Pull\nLift in a controlled arc without jerking or using momentum.\n4. Top Position\nPause briefly at the top to maximize muscle activation. Hold for 1 second.\n5. Lower\nSlowly lower the weight, keeping constant tension across reps.\n\nKey points:\n- Shoulder isolation exercises require strict form — momentum defeats the purpose.\n- Do not raise above shoulder height unless the exercise specifically calls for it.\n- Light weight with control beats heavy weight with swinging.'
  }

  if (normalized.includes('plank') || normalized.includes('crunch') || normalized.includes('twist') || normalized.includes('woodchopper')) {
    return '1. Setup\nBrace your abs and set your lower back in a neutral position.\n2. Starting Position\nBody aligned, core engaged, neck relaxed.\n3. Movement\nPerform each rep with a controlled tempo and no sudden jerks. Movement is driven by the core.\n4. Breathing\nExhale on the effort phase. Maintain abdominal tension throughout.\n5. Complete\nMaintain quality until the last rep.\n\nKey points:\n- Core exercises are about quality contractions, not speed.\n- Keep your lower back protected — if it arches, reduce difficulty.\n- Exhale on effort for deeper ab activation.'
  }

  if (normalized.includes('calf')) {
    return '1. Setup\nPosition your forefoot on the edge of a platform or calf raise machine. Keep ankles aligned and stable.\n2. Starting Position\nLower your heels below the platform to feel a full calf stretch.\n3. Raise\nRise onto your toes through maximal calf contraction. Push through the balls of your feet.\n4. Top Position\nPause briefly at the top without rolling your ankles outward. Squeeze for 1-2 seconds.\n5. Lower\nSlowly lower your heels back to the full stretch position.\n\nKey points:\n- Full range of motion is essential: deep stretch at bottom, full squeeze at top.\n- Use a slow tempo — calves respond well to time under tension.\n- Keep ankle alignment neutral; do not roll outward.'
  }

  if (normalized.includes('burpee') || normalized.includes('mountain climber') || normalized.includes('jumping jack') || normalized.includes('high knees')) {
    return '1. Start\nBegin with an active core and neutral posture before accelerating pace.\n2. Execution\nPerform each rep with proper joint alignment and controlled movement.\n3. Landing\nKeep all landings soft with bent knees to protect your joints.\n4. Breathing\nBreathe rhythmically and maintain movement quality even as fatigue builds.\n5. Adjust\nIf form degrades, slightly reduce tempo and continue with control.\n\nKey points:\n- Movement quality always beats speed — slow down if form breaks.\n- Soft, quiet landings protect your joints and indicate good control.\n- Keep your core engaged throughout for stability and injury prevention.'
  }

  return tag
    ? (defaultTechniqueByTag[tag] ??
      '1. Setup\nSet a stable posture and brace your core before starting the movement.\n2. Starting Position\nPosition your body so the target muscles are loaded from the start.\n3. Execution\nPerform each rep with a controlled tempo. Focus on the target muscles doing the work.\n4. Control\nKeep tension on the target muscles and avoid using momentum.\n5. Finish\nComplete the set with full range of motion and clean technique on every rep.\n\nKey points:\n- Controlled tempo beats fast, sloppy reps every time.\n- If you cannot feel the target muscle working, reduce the weight.\n- Full range of motion builds more muscle than partial reps with heavy weight.')
    : '1. Setup\nSet a stable posture and brace your core before starting the movement.\n2. Starting Position\nPosition your body so the target muscles are loaded from the start.\n3. Execution\nPerform each rep with a controlled tempo. Focus on the target muscles doing the work.\n4. Control\nKeep tension on the target muscles and avoid using momentum.\n5. Finish\nComplete the set with full range of motion and clean technique on every rep.\n\nKey points:\n- Controlled tempo beats fast, sloppy reps every time.\n- If you cannot feel the target muscle working, reduce the weight.\n- Full range of motion builds more muscle than partial reps with heavy weight.'
}

export function getExerciseInfo(exerciseName: string, zone?: string, tag?: BuilderExerciseTag): ExerciseInfo {
  const lookupKey = resolveExerciseContentKey(exerciseName)
  const specific = exerciseInfoMap[lookupKey]

  if (specific) {
    return specific
  }

  return {
    muscles: resolveMuscles(exerciseName, zone),
    technique: resolveTechnique(exerciseName, tag),
  }
}

export { exerciseInfoMap }
