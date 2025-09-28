import { CertificateType } from "generated/client";

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  ROLEPLAY: "Certificate of Completion",
  TEAM_RECOGNITION: "Certificate of Recognition",
  EXTERNAL: "Certificate of Collaboration",
  APPRECIATION: "Certificate of Appreciation",
  ACHIEVEMENT: "Certificate of Achievement",
  PARTICIPATION: "Certificate of Participation"
};

export const CERTIFICATE_TYPE_TITLES: Record<CertificateType, string> = {
  ROLEPLAY: "MYSverse Certificate of Completion",
  TEAM_RECOGNITION: "Certificate of Recognition",
  EXTERNAL: "Certificate of Collaboration",
  APPRECIATION: "Certificate of Appreciation",
  ACHIEVEMENT: "Certificate of Achievement",
  PARTICIPATION: "Certificate of Participation"
};

export const CERTIFICATE_TYPE_SHORT_NAMES: Record<CertificateType, string> = {
  ROLEPLAY: "MYSverse Sim",
  TEAM_RECOGNITION: "Recognition",
  EXTERNAL: "Collaboration",
  APPRECIATION: "Appreciation",
  ACHIEVEMENT: "Achievement",
  PARTICIPATION: "Participation"
};

const REASON_REQUIRED_TYPES = new Set<CertificateType>([
  "APPRECIATION",
  "ACHIEVEMENT",
  "PARTICIPATION"
]);

const ROBLOX_ID_FRIENDLY_TYPES = new Set<CertificateType>([
  "ROLEPLAY",
  "APPRECIATION",
  "ACHIEVEMENT",
  "PARTICIPATION"
]);

export function certificateRequiresReason(type: CertificateType) {
  return REASON_REQUIRED_TYPES.has(type);
}

export function certificateSupportsRobloxId(type: CertificateType) {
  return ROBLOX_ID_FRIENDLY_TYPES.has(type);
}

type CertificateCopyInput = {
  recipientName: string;
  courseName: string;
  reason?: string;
  robloxUserID?: string;
  recipientUserID?: string;
  externalOrg?: string;
};

type CertificateCopy = {
  title: string;
  introLine: string;
  actionLine: string;
  mainLine: string;
  secondaryLine?: string;
  description: string;
};

function formatRobloxSuffix(robloxUserID?: string) {
  return robloxUserID ? ` (Roblox ID: ${robloxUserID})` : "";
}

export function getCertificateCopy(
  type: CertificateType,
  {
    recipientName,
    courseName,
    reason,
    robloxUserID,
    recipientUserID,
    externalOrg
  }: CertificateCopyInput
): CertificateCopy {
  const trimmedReason = reason?.trim();

  switch (type) {
    case "ROLEPLAY": {
      const robloxSuffix = robloxUserID ? ` (ID: ${robloxUserID})` : "";
      return {
        title: CERTIFICATE_TYPE_TITLES[type],
        introLine: "This certifies that",
        actionLine: "has successfully completed the module",
        mainLine: courseName,
        description: `This certifies that Roblox user ${recipientName}${robloxSuffix} has achieved ${courseName} certification within the MYSverse Sim virtual roleplay community. This certificate should not imply any real-world qualifications or achievements outside of its intended context.`
      };
    }
    case "TEAM_RECOGNITION": {
      const userIdSuffix = recipientUserID ? ` (${recipientUserID})` : "";
      return {
        title: CERTIFICATE_TYPE_TITLES[type],
        introLine: "This certificate recognizes",
        actionLine: "for their outstanding contribution as",
        mainLine: courseName,
        description: `This certificate recognizes ${recipientName}${userIdSuffix} for their outstanding contribution as a ${courseName} in MYSverse.`
      };
    }
    case "EXTERNAL": {
      return {
        title: CERTIFICATE_TYPE_TITLES[type],
        introLine: "This certifies that",
        actionLine: "has successfully completed work on",
        mainLine: courseName,
        secondaryLine: externalOrg
          ? `in collaboration with ${externalOrg}`
          : undefined,
        description: `This certifies that ${recipientName} has successfully completed tasks ${
          externalOrg
            ? `in collaboration with ${externalOrg}`
            : "as part of a collaboration"
        } for the ${courseName} project.`
      };
    }
    case "APPRECIATION": {
      const primaryLine = trimmedReason ?? courseName;
      return {
        title: CERTIFICATE_TYPE_TITLES[type],
        introLine: "This certificate is proudly presented to",
        actionLine: "in appreciation of their dedication as",
        mainLine: primaryLine,
        secondaryLine: trimmedReason ? courseName : undefined,
        description: `We extend our sincere appreciation to ${recipientName}${formatRobloxSuffix(
          robloxUserID
        )} for their valued contributions${
          trimmedReason ? ` as ${trimmedReason}` : ""
        } within ${courseName}.`
      };
    }
    case "ACHIEVEMENT": {
      const primaryLine = trimmedReason ?? courseName;
      return {
        title: CERTIFICATE_TYPE_TITLES[type],
        introLine: "This certifies that",
        actionLine: "has achieved",
        mainLine: primaryLine,
        secondaryLine: trimmedReason ? `for ${courseName}` : undefined,
        description: `${recipientName}${formatRobloxSuffix(
          robloxUserID
        )} has achieved ${primaryLine}${
          trimmedReason ? ` in ${courseName}` : ""
        }, demonstrating remarkable excellence.`
      };
    }
    case "PARTICIPATION": {
      return {
        title: CERTIFICATE_TYPE_TITLES[type],
        introLine: "This certifies that",
        actionLine: "has participated in",
        mainLine: courseName,
        secondaryLine:
          trimmedReason && trimmedReason.toLowerCase() !== "participation"
            ? trimmedReason
            : undefined,
        description: `${recipientName}${formatRobloxSuffix(
          robloxUserID
        )} actively participated in ${courseName}${
          trimmedReason && trimmedReason.toLowerCase() !== "participation"
            ? ` as ${trimmedReason}`
            : ""
        }.`
      };
    }
    default: {
      return {
        title: "Certificate",
        introLine: "This certifies that",
        actionLine: "is hereby recognized",
        mainLine: courseName,
        description: `${recipientName}${formatRobloxSuffix(
          robloxUserID
        )} is recognized for their contributions to ${courseName}.`
      };
    }
  }
}
