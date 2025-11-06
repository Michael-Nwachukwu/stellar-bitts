"use client";

import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AtomIcon from "@/components/icons/atom";
import BracketsIcon from "@/components/icons/brackets";
import ProcessorIcon from "@/components/icons/proccesor";
import CuteRobotIcon from "@/components/icons/cute-robot";
import GearIcon from "@/components/icons/gear";
import MonkeyIcon from "@/components/icons/monkey";
import { Bullet } from "@/components/ui/bullet";
import LockIcon from "@/components/icons/lock";
import ConnectAccount from "@/components/ConnectAccount";
import NetworkPill from "@/components/NetworkPill";
import { stellarNetwork } from "@/contracts/util";
import FundAccountButton from "@/components/FundAccountButton";
import { Link } from "react-router-dom";

const data = {
  navMain: [
    {
      title: "Lending Platform",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: BracketsIcon,
          isActive: true,
        },
        {
          title: "Marketplace",
          url: "/marketplace",
          icon: AtomIcon,
          isActive: false,
        },
        {
          title: "Create Offer",
          url: "/create-offer",
          icon: ProcessorIcon,
          isActive: false,
        },
        {
          title: "My Positions",
          url: "/positions",
          icon: CuteRobotIcon,
          isActive: false,
        },
        {
          title: "Admin Settings",
          url: "/admin",
          icon: GearIcon,
          isActive: false,
          locked: true,
        },
      ],
    },
  ],
  desktop: {
    title: "Desktop (Online)",
    status: "online",
  },
  user: {
    name: "KRIMSON",
    email: "krimson@joyco.studio",
    avatar: "/avatars/user_krimson.png",
  },
};

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <MonkeyIcon className="size-20 group-hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">Stellar Bits</span>
          <span className="text-xs uppercase">P2P Protocol</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group, i) => (
          <SidebarGroup
            className={cn(i === 0 && "rounded-t-none")}
            key={group.title}
          >
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      item.locked && "pointer-events-none opacity-50",
                    )}
                    data-disabled={item.locked}
                  >
                    <SidebarMenuButton
                      asChild={!item.locked}
                      isActive={item.isActive}
                      disabled={item.locked}
                      className={cn(
                        "disabled:cursor-not-allowed",
                        item.locked && "pointer-events-none",
                      )}
                    >
                      {item.locked ? (
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </div>
                      ) : (
                        <Link to={item.url}>
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.locked && (
                      <SidebarMenuBadge>
                        <LockIcon className="size-5 block" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            User
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="p-2">
                  <ConnectAccount />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="flex items-center gap-2">
          {stellarNetwork !== "PUBLIC" && <FundAccountButton />}
          <NetworkPill />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
