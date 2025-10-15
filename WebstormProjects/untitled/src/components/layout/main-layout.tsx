"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Truck, Users, Settings, FileText, Ambulance, Building, RadioTower, SatelliteDish, MapPin, Upload } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import Header from './header';

const menuItems = [
  { href: '/dashboard', label: 'Vozidlá', icon: Truck },
  { href: '/dashboard/providers', label: 'Poskytovatelia', icon: Building },
  { href: '/dashboard/network-points', label: 'Sieťové body', icon: MapPin },
  { href: '/dashboard/import-data', label: 'Import Data', icon: Upload },
  // { href: '/dashboard/rdst-devices', label: 'RDST Zariadenia', icon: RadioTower },
  // { href: '/dashboard/avl-devices', label: 'AVL Zariadenia', icon: SatelliteDish },
]

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    // Exact match for dashboard root
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // For other routes, check if pathname starts with the href
    return pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
                <Ambulance className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">Záchrana</h1>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label }}
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
