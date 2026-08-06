import "server-only";

import type { ExpenseApplication } from "@/lib/types/database";
import { formatYenNumber } from "@/lib/format";

export type NotificationEventType =
  | "submitted"
  | "resubmitted"
  | "approved"
  | "returned";

export type WebPushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  badgeCount: number;
  icon: string;
  badge: string;
};

export function buildExpensePushPayload(
  eventType: NotificationEventType,
  application: Pick<
    ExpenseApplication,
    | "id"
    | "application_no"
    | "applicant_name_snapshot"
    | "category_name_snapshot"
    | "amount"
    | "version"
  >,
  badgeCount: number,
): WebPushPayload {
  const amountLabel = formatYenNumber(application.amount);
  const category = application.category_name_snapshot;
  const name = application.applicant_name_snapshot;
  const version = application.version;

  switch (eventType) {
    case "submitted":
      return {
        title: "新しい経費申請",
        body: `${name}さんから${category}・${amountLabel}円の申請が届きました`,
        url: `/admin/applications/${application.id}`,
        tag: `expense-submitted-${application.id}-${version}`,
        badgeCount,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-96.png",
      };
    case "resubmitted":
      return {
        title: "経費申請が再提出されました",
        body: `${name}さんが${application.application_no}を修正して再申請しました`,
        url: `/admin/applications/${application.id}`,
        tag: `expense-resubmitted-${application.id}-${version}`,
        badgeCount,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-96.png",
      };
    case "approved":
      return {
        title: "経費申請が承認されました",
        body: `${category}・${amountLabel}円の申請が承認されました`,
        url: `/app/applications/${application.id}`,
        tag: `expense-approved-${application.id}-${version}`,
        badgeCount,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-96.png",
      };
    case "returned":
      return {
        title: "経費申請の修正が必要です",
        body: `${category}・${amountLabel}円の申請が差し戻されました`,
        url: `/app/applications/${application.id}/edit`,
        tag: `expense-returned-${application.id}-${version}`,
        badgeCount,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-96.png",
      };
  }
}
