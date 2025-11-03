"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bullet } from "@/components/ui/bullet";
import NotificationItem from "./notification-item";
import type { Notification } from "@/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";

interface NotificationsProps {
  initialNotifications: Notification[];
}

export default function Notifications({
  initialNotifications,
}: NotificationsProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [showAll, setShowAll] = useState(false);

  console.log(notifications);

  const lendingNotifications: Notification[] = [
    {
      id: "1",
      title: "Loan Repaid",
      message: "Loan #5921 from GXYZ...DEF has been repaid",
      type: "success",
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      priority: "low",
    },
    {
      id: "2",
      title: "Health Warning",
      message: "Loan #5922 health factor dropped to 1.2",
      type: "warning",
      read: false,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      priority: "low",
    },
    {
      id: "3",
      title: "Interest Earned",
      message: "You earned $450 in interest from offer #offer_1",
      type: "success",
      read: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      priority: "low",
    },
    {
      id: "4",
      title: "Overdue Loan",
      message: "Loan #5920 is now overdue",
      type: "error",
      read: true,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      priority: "low",
    },
  ];

  const unreadCount = lendingNotifications.filter((n) => !n.read).length;
  const displayedNotifications = showAll
    ? lendingNotifications
    : lendingNotifications.slice(0, 3);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between pl-3 pr-1">
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
          {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : <Bullet />}
          Notifications
        </CardTitle>
        {lendingNotifications.length > 0 && (
          <Button
            className="opacity-50 hover:opacity-100 uppercase"
            size="sm"
            variant="ghost"
            onClick={clearAll}
          >
            Clear All
          </Button>
        )}
      </CardHeader>

      <CardContent className="bg-accent p-1.5 overflow-hidden">
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {displayedNotifications.map((notification) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={notification.id}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              </motion.div>
            ))}

            {lendingNotifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
              </div>
            )}

            {lendingNotifications.length > 3 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full"
                >
                  {showAll
                    ? "Show Less"
                    : `Show All (${lendingNotifications.length})`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
