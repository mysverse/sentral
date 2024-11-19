"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IDetectedBarcode,
  Scanner,
  useDevices
} from "@yudiel/react-qr-scanner";
import { Transition } from "@headlessui/react";
import useTabVisibility from "hooks/useTabVisibility";

export default function QRCodeScanner() {
  const router = useRouter();
  const devices = useDevices();
  const isTabVisible = useTabVisibility();

  const [error, setError] = useState<string>();
  const [code, setCode] = useState<string>();
  const [manualCode, setManualCode] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");

  const handleResult = (detectedCodes: IDetectedBarcode[]) => {
    if (!code) {
      for (const detectedCode of detectedCodes) {
        const text = detectedCode.rawValue;
        let url: URL;
        try {
          url = new URL(text);
        } catch {
          continue;
        }

        const hostname = url.hostname;
        if (!hostname.endsWith("mys.gg") && !hostname.endsWith("mysver.se")) {
          continue;
        }
        let urlCode = url.searchParams.get("code");
        if (!urlCode) {
          const pathSegments = url.pathname.split("/");
          const lastSegment = pathSegments[pathSegments.length - 1];
          if (pathSegments[pathSegments.length - 2] === "v") {
            urlCode = lastSegment;
          } else if (pathSegments[pathSegments.length - 2] === "verify") {
            urlCode = lastSegment;
          }
        }

        if (urlCode) {
          setCode(urlCode);
          // wait 1 second
          setTimeout(() => {
            router.push(`/verify/${urlCode}`);
          }, 600);
          break;
        }
      }
    }
  };

  const handleManualSubmit = () => {
    if (inputRef.current && !inputRef.current.checkValidity()) {
      inputRef.current.reportValidity(); // Show the browser's default validation message
    } else {
      if (manualCode) {
        setCode(manualCode);
        setTimeout(() => {
          router.push(`/verify/${manualCode}`);
        }, 600);
      }
    }
  };

  const handleError = (error: any) => {
    const name = error.name;
    if (name && typeof name === "string") {
      setError(error.name);
    }
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div>
      {error === "NotAllowedError" ? (
        <p className="mb-4 italic opacity-50">
          You need to grant camera permissions on your device to use the
          scanner.
        </p>
      ) : (
        <>
          <Transition
            as="div"
            appear={true}
            show={!code}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            className="mb-4 flex flex-col items-center gap-4"
          >
            {/* Show a list of devices from the useDevices hook */}
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              onChange={(e) => {
                if (!e.target.disabled) setDeviceId(e.target.value);
              }}
              value={deviceId}
            >
              <option value="" disabled>
                Select a camera
              </option>
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
            <div className="aspect-square w-full overflow-hidden rounded-xl sm:w-96">
              {isTabVisible && devices.length > 0 && (
                <Scanner
                  constraints={{
                    deviceId,
                    aspectRatio: 1,
                    facingMode: { ideal: "environment" }
                  }}
                  paused={!!code}
                  onScan={handleResult}
                  onError={handleError}
                  allowMultiple={false}
                />
              )}
            </div>
          </Transition>
        </>
      )}
      <Transition
        as="div"
        appear={true}
        show={!code}
        enter="transition-opacity duration-500"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter code manually"
            value={manualCode}
            pattern=".{7,7}"
            maxLength={7}
            minLength={7}
            onChange={(e) => {
              setManualCode(e.target.value.toUpperCase());
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleManualSubmit();
            }}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            ref={inputRef}
          />
          <button
            onClick={handleManualSubmit}
            className="mt-2 w-full transform rounded-lg bg-blue-600 px-4 py-2 text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:mt-4"
          >
            Submit Code
          </button>
        </div>
      </Transition>
      <Transition
        show={!!code}
        enter="transition-opacity duration-200 delay-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-1000"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <p>Validating...</p>
      </Transition>
    </div>
  );
}
