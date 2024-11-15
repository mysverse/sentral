// components/QRCodeScanner.jsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  IDetectedBarcode,
  Scanner,
  useDevices
} from "@yudiel/react-qr-scanner";
import { Transition } from "@headlessui/react";

export default function QRCodeScanner() {
  const router = useRouter();
  const devices = useDevices();

  const [error, setError] = useState<string>();
  const [code, setCode] = useState<string>();
  const [manualCode, setManualCode] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");

  const handleResult = (detectedCodes: IDetectedBarcode[]) => {
    if (!code) {
      for (const detectedCode of detectedCodes) {
        const text = detectedCode.rawValue;
        const url = new URL(text);
        const urlCode = url.searchParams.get("code");
        if (urlCode) {
          setCode(urlCode);
          // wait 1 second
          setTimeout(() => {
            router.push(`/verify?code=${urlCode}`);
          }, 600);
          break;
        }
      }
    }
  };

  const handleManualSubmit = () => {
    if (manualCode) {
      setCode(manualCode);
      setTimeout(() => {
        router.push(`/verify?code=${manualCode}`);
      }, 600);
    }
  };

  const handleError = (error: any) => {
    const name = error.name;
    if (name && typeof name === "string") {
      setError(error.name);
    }
  };

  return (
    <div>
      {error === "NotAllowedError" || error === "OverconstrainedError" ? (
        <p>You need to grant camera permissions on your device.</p>
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
            className="flex flex-col items-center gap-4"
          >
            {/* Show a list of devices from the useDevices hook */}
            <select
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              onChange={(e) => {
                if (!e.target.disabled) setDeviceId(e.target.value);
              }}
              defaultValue={deviceId}
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
              <Scanner
                constraints={{ deviceId, facingMode: { exact: "environment" } }}
                onScan={handleResult}
                onError={handleError}
                allowMultiple={false}
              />
            </div>
            <div className="w-full">
              <input
                type="text"
                placeholder="Enter code manually"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleManualSubmit}
                className="mt-2 w-full transform rounded-lg bg-blue-600 px-4 py-2 text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <p>Redirecting...</p>
          </Transition>
        </>
      )}
    </div>
  );
}
