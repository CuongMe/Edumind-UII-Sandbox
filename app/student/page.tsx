import { EmptyUserPage } from "@/app/_components/empty-user-page";
import { StudentDashboard } from "@/app/student/student-dashboard";

export default function StudentPage() {
  return (
    <EmptyUserPage title="Student Page" requiredRole="student">
      <StudentDashboard />
    </EmptyUserPage>
  );
}
