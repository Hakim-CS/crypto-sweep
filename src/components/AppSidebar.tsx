
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ArrowRight, ArrowLeft, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  const { t } = useLanguage();

  // Navigation links
  const navLinks = [
    { name: t('home'), path: "/", icon: ArrowRight },
    { name: t('wallet'), path: "/wallet", icon: ArrowRight },
    { name: t('education'), path: "/education", icon: ArrowRight },
  ];

  return (
    <Sidebar className="animate-fade-in">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="font-bold text-primary">{t('cryptoTracker')}</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path}>
                      <item.icon className="min-w-[20px] mr-2" size={20} />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="block md:hidden mt-8">
              <SidebarTrigger>
                <Menu className="h-6 w-6" />
                <span className="ml-2">{t('closeMenu')}</span>
              </SidebarTrigger>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
