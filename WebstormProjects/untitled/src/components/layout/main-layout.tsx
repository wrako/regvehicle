"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Truck, Users, Settings, FileText, Ambulance, Building, RadioTower, SatelliteDish, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"


import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
} from '@/components/ui/sidebar';
import Header from './header';
import { useState } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Vozidlá', icon: Truck },
];

const managementMenuItems = [
    { href: '/dashboard/providers', label: 'Poskytovatelia', icon: Building },
    { href: '/dashboard/network-points', label: 'Sieťové body', icon: MapPin },
    // { href: '/dashboard/rdst-devices', label: 'RDST Zariadenia', icon: RadioTower },
    // { href: '/dashboard/avl-devices', label: 'AVL Zariadenia', icon: SatelliteDish },
]

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isManagementOpen, setIsManagementOpen] = useState(true);

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
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
             <SidebarGroup>
                <Collapsible open={isManagementOpen} onOpenChange={setIsManagementOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium text-left rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
                        <span>Správa</span>
                        {isManagementOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenu className="mt-2">
                        {managementMenuItems.map((item) => (
                          <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname.startsWith(item.href)}
                              tooltip={{ children: item.label }}
                            >
                              <Link href={item.href}>
                                <item.icon />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </CollapsibleContent>
                </Collapsible>
             </SidebarGroup>
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
