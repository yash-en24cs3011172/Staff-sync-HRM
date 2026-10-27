import heroWorkspaceImg from '../assets/images/hero_hrm_workspace.jpg';
import avatarHrImg from '../assets/images/avatar_hr_director_1793121249231.jpg';
import avatarManagerImg from '../assets/images/avatar_engineering_manager_1793121249846.jpg';
import avatarEmployeeImg from '../assets/images/avatar_senior_employee_1793121249867.jpg';

export const ASSETS = {
  heroWorkspace: heroWorkspaceImg,
  avatars: {
    hr: avatarHrImg,
    manager: avatarManagerImg,
    employee: avatarEmployeeImg,
  },
} as const;
