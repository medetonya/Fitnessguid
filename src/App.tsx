import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import SupportFab from './components/SupportFab'
import LanguageSwitcher from './components/LanguageSwitcher'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ProgramDetailsPage from './pages/ProgramDetailsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import HomeWorkoutsPage from './pages/HomeWorkoutsPage'
import GymWorkoutsPage from './pages/GymWorkoutsPage'
import ChooseGoalPage from './pages/ChooseGoalPage'
import GymChooseGoalPage from './pages/GymChooseGoalPage'
import GymChecklistPage from './pages/GymChecklistPage'
import GymMotivationPage from './pages/GymMotivationPage'
import ProgressTrackingPage from './pages/ProgressTrackingPage'
import HowNotToQuitPage from './pages/HowNotToQuitPage'
import NutritionBasicsPage from './pages/NutritionBasicsPage'
import CalorieMacroFormulasPage from './pages/CalorieMacroFormulasPage'
import HarvardPlatePage from './pages/HarvardPlatePage'
import ProgressPage from './pages/ProgressPage'
import SupportPage from './pages/SupportPage'
import FatLossHomePage from './pages/FatLossHomePage'
import MuscleToneHomePage from './pages/MuscleToneHomePage'
import ReadyWorkoutFatLossPage from './pages/ReadyWorkoutFatLossPage'
import FatLossWorkoutSheetPage from './pages/FatLossWorkoutSheetPage'
import FatLossTrainingModePage from './pages/FatLossTrainingModePage'
import ReadySchemePage from './pages/ReadySchemePage'
import ReadySchemeTonePage from './pages/ReadySchemeTonePage'
import ReadyWorkoutTonePage from './pages/ReadyWorkoutTonePage'
import ToneWorkoutSheetPage from './pages/ToneWorkoutSheetPage'
import ToneTrainingModePage from './pages/ToneTrainingModePage'
import WorkoutBuilderPage from './pages/WorkoutBuilderPage'
import WorkoutBuilderTonePage from './pages/WorkoutBuilderTonePage'
import WorkoutBuilderToneFullBodyPage from './pages/WorkoutBuilderToneFullBodyPage'
import WorkoutBuilderToneUpperBodyPage from './pages/WorkoutBuilderToneUpperBodyPage'
import WorkoutBuilderToneLowerBodyPage from './pages/WorkoutBuilderToneLowerBodyPage'
import WorkoutBuilderFullBodyPage from './pages/WorkoutBuilderFullBodyPage'
import WorkoutBuilderUpperBodyPage from './pages/WorkoutBuilderUpperBodyPage'
import WorkoutBuilderLowerBodyPage from './pages/WorkoutBuilderLowerBodyPage'
import BuilderTrainingModePage from './pages/BuilderTrainingModePage'
import MyWorkoutsPage from './pages/MyWorkoutsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfUsePage from './pages/TermsOfUsePage'
import CookiePolicyPage from './pages/CookiePolicyPage'
import FitnessDisclaimerPage from './pages/FitnessDisclaimerPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import SubscriptionExpiredPage from './pages/SubscriptionExpiredPage'
import SiteFooter from './components/SiteFooter'
import CookieConsentBanner from './components/CookieConsentBanner'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <LanguageSwitcher />
        <SupportFab />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/disclaimer" element={<FitnessDisclaimerPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/subscription-expired" element={<SubscriptionExpiredPage />} />
          <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/legal/terms" element={<TermsOfUsePage />} />
          <Route path="/legal/cookies" element={<CookiePolicyPage />} />
          <Route path="/legal/disclaimer" element={<FitnessDisclaimerPage />} />
          <Route path="/legal/refunds" element={<RefundPolicyPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireApproved>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route path="/home-workouts" element={<Navigate to="/workouts/home" replace />} />
          <Route path="/gym-workouts" element={<Navigate to="/workouts/gym" replace />} />
          <Route path="/nutrition" element={<Navigate to="/workouts/home/nutrition" replace />} />
          <Route
            path="/programs/:programId"
            element={
              <ProtectedRoute requireApproved>
                <ProgramDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home"
            element={
              <ProtectedRoute requireApproved>
                <HomeWorkoutsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal"
            element={
              <ProtectedRoute requireApproved>
                <ChooseGoalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym"
            element={
              <ProtectedRoute requireApproved>
                <GymWorkoutsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal"
            element={
              <ProtectedRoute requireApproved>
                <GymChooseGoalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/checklist"
            element={
              <ProtectedRoute requireApproved>
                <GymChecklistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/motivation"
            element={
              <ProtectedRoute requireApproved>
                <GymMotivationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss"
            element={
              <ProtectedRoute requireApproved>
                <FatLossHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone"
            element={
              <ProtectedRoute requireApproved>
                <MuscleToneHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/ready-scheme"
            element={
              <ProtectedRoute requireApproved>
                <ReadySchemePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/ready-workout"
            element={
              <ProtectedRoute requireApproved>
                <ReadyWorkoutFatLossPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/ready-workout/sheet/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <FatLossWorkoutSheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/ready-workout/training/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <FatLossTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/workout-builder"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/workout-builder/full-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderFullBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/workout-builder/upper-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderUpperBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/workout-builder/lower-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderLowerBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/fat-loss/workout-builder/training"
            element={
              <ProtectedRoute requireApproved>
                <BuilderTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/ready-scheme"
            element={
              <ProtectedRoute requireApproved>
                <ReadySchemeTonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/ready-workout"
            element={
              <ProtectedRoute requireApproved>
                <ReadyWorkoutTonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/ready-workout/sheet/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <ToneWorkoutSheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/ready-workout/training/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <ToneTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/workout-builder"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderTonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/workout-builder/full-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderToneFullBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/workout-builder/upper-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderToneUpperBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/workout-builder/lower-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderToneLowerBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/goal/muscle-tone/workout-builder/training"
            element={
              <ProtectedRoute requireApproved>
                <BuilderTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute requireApproved>
                <ProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute requireApproved>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/progress-tracking"
            element={
              <ProtectedRoute requireApproved>
                <ProgressTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/how-not-to-quit"
            element={
              <ProtectedRoute requireApproved>
                <HowNotToQuitPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/nutrition"
            element={
              <ProtectedRoute requireApproved>
                <NutritionBasicsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/nutrition"
            element={
              <ProtectedRoute requireApproved>
                <NutritionBasicsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/nutrition/calorie-macro-formulas"
            element={
              <ProtectedRoute requireApproved>
                <CalorieMacroFormulasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/nutrition/calorie-macro-formulas"
            element={
              <ProtectedRoute requireApproved>
                <CalorieMacroFormulasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/nutrition/harvard-plate"
            element={
              <ProtectedRoute requireApproved>
                <HarvardPlatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/gym/nutrition/harvard-plate"
            element={
              <ProtectedRoute requireApproved>
                <HarvardPlatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss"
            element={
              <ProtectedRoute requireApproved>
                <FatLossHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone"
            element={
              <ProtectedRoute requireApproved>
                <MuscleToneHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/ready-scheme"
            element={
              <ProtectedRoute requireApproved>
                <ReadySchemePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/ready-workout"
            element={
              <ProtectedRoute requireApproved>
                <ReadyWorkoutFatLossPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/ready-workout/sheet/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <FatLossWorkoutSheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/ready-workout/training/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <FatLossTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/ready-scheme"
            element={
              <ProtectedRoute requireApproved>
                <ReadySchemeTonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/ready-workout"
            element={
              <ProtectedRoute requireApproved>
                <ReadyWorkoutTonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/ready-workout/sheet/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <ToneWorkoutSheetPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/ready-workout/training/:dayId"
            element={
              <ProtectedRoute requireApproved>
                <ToneTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/workout-builder"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderTonePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/workout-builder/full-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderToneFullBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/workout-builder/upper-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderToneUpperBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/workout-builder/lower-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderToneLowerBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/muscle-tone/workout-builder/training"
            element={
              <ProtectedRoute requireApproved>
                <BuilderTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/workout-builder"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/workout-builder/full-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderFullBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/workout-builder/upper-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderUpperBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/workout-builder/lower-body"
            element={
              <ProtectedRoute requireApproved>
                <WorkoutBuilderLowerBodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/home/goal/fat-loss/workout-builder/training"
            element={
              <ProtectedRoute requireApproved>
                <BuilderTrainingModePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-workouts"
            element={
              <ProtectedRoute requireApproved>
                <MyWorkoutsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SiteFooter />
        <CookieConsentBanner />
      </AuthProvider>
    </Router>
  )
}

export default App
