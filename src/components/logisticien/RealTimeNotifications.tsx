"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

interface Notification {
  id: string;
  type: "status_change" | "new_accreditation" | "vehicle_update";
  message: string;
  timestamp: Date;
  accreditationId?: string;
}

interface RealTimeNotificationsProps {
  onAccreditationUpdate?: (accreditationId: string) => void;
}

export default function RealTimeNotifications({
  onAccreditationUpdate,
}: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulation de connexion WebSocket pour les notifications en temps réel
    // Dans une vraie implémentation, vous utiliseriez WebSocket ou Server-Sent Events
    const connectToNotifications = () => {
      setIsConnected(true);

      // Simuler des notifications de test
      setTimeout(() => {
        addNotification({
          type: "status_change",
          message: "Statut mis à jour pour l'accréditation #12345",
          accreditationId: "12345",
        });
      }, 5000);
    };

    connectToNotifications();

    return () => {
      setIsConnected(false);
    };
  }, []);

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Garder max 5 notifications

    // Auto-suppression après 10 secondes
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.accreditationId && onAccreditationUpdate) {
      onAccreditationUpdate(notification.accreditationId);
    }
    removeNotification(notification.id);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white border-l-4 shadow-lg rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl ${
            notification.type === "status_change"
              ? "border-blue-500"
              : notification.type === "new_accreditation"
                ? "border-green-500"
                : "border-orange-500"
          }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.timestamp.toLocaleTimeString("fr-FR")}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Indicateur de connexion */}
      <div
        className={`text-xs text-center ${
          isConnected ? "text-green-600" : "text-red-600"
        }`}
      >
        {isConnected ? "● Connecté" : "○ Déconnecté"}
      </div>
    </div>
  );
}
