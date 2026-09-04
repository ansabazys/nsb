/**
 * Navigation item structure for the NSB Life OS
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const APP_NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Habits", href: "/habits" },
  { title: "Expenses", href: "/expenses" },
  { title: "Goals", href: "/goals" },
  { title: "Tasks", href: "/tasks" },
  { title: "Settings", href: "/settings" },
];
