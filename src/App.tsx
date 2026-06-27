import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import AssessmentHome from "@/pages/assessment/AssessmentHome";
import AssessmentQuiz from "@/pages/assessment/AssessmentQuiz";
import AssessmentReport from "@/pages/assessment/AssessmentReport";
import GoalList from "@/pages/growth/GoalList";
import GoalDetail from "@/pages/growth/GoalDetail";
import AICompanion from "@/pages/AICompanion";
import PracticeList from "@/pages/practice/PracticeList";
import PracticeDetail from "@/pages/practice/PracticeDetail";
import ProfileHome from "@/pages/profile/ProfileHome";
import GrowthArchive from "@/pages/profile/GrowthArchive";
import Settings from "@/pages/profile/Settings";
import Membership from "@/pages/profile/Membership";
import Onboarding from "@/pages/Onboarding";
import NotFound from "@/pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* 全屏页（无侧边栏） */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/assessment/start/:mode"
          element={
            <AppLayout hideTopBar>
              <AssessmentQuiz />
            </AppLayout>
          }
        />

        {/* 主应用页（带侧边栏 + 顶栏） */}
        <Route
          path="/"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/assessment"
          element={
            <AppLayout>
              <AssessmentHome />
            </AppLayout>
          }
        />
        <Route
          path="/assessment/report/:id"
          element={
            <AppLayout>
              <AssessmentReport />
            </AppLayout>
          }
        />
        <Route
          path="/growth"
          element={
            <AppLayout>
              <GoalList />
            </AppLayout>
          }
        />
        <Route
          path="/growth/:goalId"
          element={
            <AppLayout>
              <GoalDetail />
            </AppLayout>
          }
        />
        <Route
          path="/ai-companion"
          element={
            <AppLayout hideTopBar>
              <AICompanion />
            </AppLayout>
          }
        />
        <Route
          path="/practice"
          element={
            <AppLayout>
              <PracticeList />
            </AppLayout>
          }
        />
        <Route
          path="/practice/:id"
          element={
            <AppLayout>
              <PracticeDetail />
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout>
              <ProfileHome />
            </AppLayout>
          }
        />
        <Route
          path="/profile/archive"
          element={
            <AppLayout>
              <GrowthArchive />
            </AppLayout>
          }
        />
        <Route
          path="/profile/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
        <Route
          path="/profile/membership"
          element={
            <AppLayout>
              <Membership />
            </AppLayout>
          }
        />

        {/* 404 兜底 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
