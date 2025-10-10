"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowPathIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/20/solid";
import { useImageData, useNametagTemplates } from "components/swr";
import { isStandalonePWA } from "components/utils";
import { usePlausible } from "next-plausible";
import Image from "next/image";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import * as Switch from "@radix-ui/react-switch";
import { motion, AnimatePresence } from "motion/react";

// Constants
const NAMETAG_LENGTH_LIMIT = 12;

// Utilities
function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .substring(0, NAMETAG_LENGTH_LIMIT);
}

// Components
function NametagImage({
  name,
  index,
  preview = false,
  tShirtIDs = [],
  shouldTry,
  isGenerating = false
}: {
  name: string;
  index: number;
  preview?: boolean;
  tShirtIDs?: number[];
  shouldTry: boolean;
  isGenerating?: boolean;
}) {
  const shouldFetch =
    shouldTry &&
    name?.trim().length > 0 &&
    name.length <= NAMETAG_LENGTH_LIMIT &&
    index >= 0;

  const { image, isLoading, isError } = useImageData(
    name,
    index,
    preview,
    tShirtIDs,
    shouldFetch
  );

  const showLoadingState = isGenerating || isLoading;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={showLoadingState ? "loading" : "content"}
        className="flex h-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {showLoadingState ? (
          <div className="m-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ArrowPathIcon
                className="size-16 text-blue-500"
                aria-hidden="true"
              />
            </motion.div>
          </div>
        ) : isError ? (
          <div className="m-auto">
            <ArrowPathIcon
              className="size-16 text-red-300"
              aria-hidden="true"
            />
          </div>
        ) : image ? (
          <div className="m-auto">
            <a
              href={preview ? undefined : URL.createObjectURL(image)}
              download={`nametag_${sanitizeName(name)}`}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Image
                  height={128}
                  width={128}
                  src={URL.createObjectURL(image)}
                  alt={`Nametag with name "${name}"`}
                  unoptimized
                />
              </motion.div>
            </a>
          </div>
        ) : (
          <div className="m-auto text-gray-400">
            <svg
              className="size-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function CustomSelect({
  templates,
  currentIndex,
  setCurrentIndex
}: {
  templates: Array<{ name: string }> | undefined;
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Select.Root
      open={open}
      onOpenChange={setOpen}
      value={templates ? String(currentIndex) : ""}
      onValueChange={(val: string) => {
        setCurrentIndex(Number(val));
      }}
    >
      <Select.Trigger asChild>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs transition-colors duration-200 hover:bg-gray-50 focus:border-slate-500 focus:ring-blue-500 focus:outline-none"
          style={{ willChange: "transform" }}
        >
          <Select.Value placeholder="Select a variant..." />
          <Select.Icon>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </Select.Icon>
        </motion.button>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content asChild>
          <motion.div
            className="z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", bounce: 0.2 }}
            style={{ willChange: "transform, opacity" }}
          >
            <Select.Viewport className="py-1">
              {templates?.map((template, index) => (
                <Select.Item
                  key={index}
                  value={String(index)}
                  className="cursor-pointer px-3 py-2 text-sm text-gray-900 transition-colors duration-150 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none data-[highlighted]:bg-blue-50"
                >
                  <Select.ItemText>
                    {!isStandalonePWA()
                      ? template.name
                      : `Variant ${index + 1}`}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </motion.div>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function CustomSwitch({
  checked,
  setChecked
}: {
  checked: boolean;
  setChecked: (val: boolean) => void;
}) {
  return (
    <Switch.Root checked={checked} onCheckedChange={setChecked} asChild>
      <button
        type="button"
        className={`flex h-8 w-14 items-center rounded-full px-1 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          checked ? "bg-emerald-400" : "bg-slate-400"
        }`}
        style={{ justifyContent: checked ? "flex-end" : "flex-start" }}
      >
        <Switch.Thumb asChild>
          <motion.div
            className="block h-6 w-6 rounded-full bg-white shadow"
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </Switch.Thumb>
      </button>
    </Switch.Root>
  );
}

function FormHeader() {
  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Generate nametag
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Enter a name{" "}
        <ChevronRightIcon className="inline h-4 w-4" aria-hidden="true" />
        <span>Select a nametag variant</span>
        <ChevronRightIcon className="inline h-4 w-4" aria-hidden="true" />
        <span>Watch it generate automatically</span>
        <ChevronRightIcon className="inline h-4 w-4" aria-hidden="true" />
        <span>Click the generated image to save</span>
        {!isStandalonePWA() && (
          <>
            <ChevronRightIcon className="inline h-4 w-4" aria-hidden="true" />
            <span className="text-blue-600 underline visited:text-purple-600 hover:text-blue-800">
              <a
                href="https://create.roblox.com/dashboard/creations/upload?assetType=TShirt"
                target="_blank"
                rel="noreferrer"
              >
                Upload to Roblox as T-Shirt
              </a>
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function KnownIssuesAlert() {
  return (
    <div className="mt-4 rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="shrink-0">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="size-5 text-yellow-400"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Known issues and limitations
          </h3>
          <ul className="mt-2 list-disc text-sm text-yellow-700">
            <li>
              For templates using custom characters (police, army, navy), only{" "}
              <b>alphabets</b> are currently supported.
            </li>
            <li>
              Numbers and special characters may not be visible. Please contact
              your quartermaster if you require them.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function NametagForm() {
  const { templates } = useNametagTemplates(true);
  const [name, setName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [preview, setPreview] = useState(false);
  const [addTShirt, setAddTShirt] = useState(false);
  const [currentTShirtID, setCurrentTShirtID] = useState<number>();
  const [tShirtIDs, setTShirtIDs] = useState<number[]>([]);
  const [shouldGenerate, setShouldGenerate] = useState(false);

  const plausible = usePlausible();

  // Derived value: we're "generating" while waiting for debounce
  const isGenerating = !!(name.trim() && templates);

  // Debounced auto-generation - setState in setTimeout is acceptable for debouncing
  useEffect(() => {
    // Early return if conditions not met
    if (!name.trim() || !templates) {
      return;
    }

    // Set up debounced callback
    const debounceTimer = setTimeout(() => {
      setShouldGenerate(true);

      // Track analytics
      plausible("gentagAutoGenerate", {
        props: {
          name: name,
          category: templates?.[currentIndex]?.name
        }
      });
    }, 800); // 800ms debounce

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [name, currentIndex, preview, addTShirt, tShirtIDs, templates, plausible]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setShouldGenerate(false);
  }, []);

  const handleVariantChange = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setShouldGenerate(false);
  }, []);

  const handleTShirtIDChange = useCallback((value: string) => {
    const id = parseInt(value);
    setCurrentTShirtID(id);
    setTShirtIDs([id]);
    setShouldGenerate(false);
  }, []);

  const handlePreviewToggle = useCallback((checked: boolean) => {
    setPreview(checked);
  }, []);

  const handleAddTShirtToggle = useCallback((checked: boolean) => {
    setAddTShirt(checked);
  }, []);

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Header */}
      <FormHeader />

      {/* Known Issues Alert */}
      <KnownIssuesAlert />

      {/* Main Content Section - Image and Inputs */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Left Column - Nametag Preview */}
        <div className="flex justify-center lg:flex-shrink-0 lg:justify-start">
          <motion.div
            className="relative h-36 w-36 overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <NametagImage
              name={name}
              index={currentIndex}
              preview={preview}
              tShirtIDs={addTShirt ? tShirtIDs : []}
              shouldTry={shouldGenerate}
              isGenerating={isGenerating}
            />
          </motion.div>
        </div>

        {/* Right Column - Form Inputs */}
        <div className="space-y-4 lg:flex-1">
          {/* Row 1: Text and Variant inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name Input */}
            <div>
              <label
                htmlFor="nametag_name"
                className="block text-sm font-medium text-gray-700"
              >
                Text
              </label>
              <div className="mt-1">
                <motion.input
                  type="text"
                  name="nametag_name"
                  id="nametag_name"
                  autoComplete="nametag_name"
                  placeholder="12 characters max"
                  value={name}
                  className="block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-xs transition-all duration-200 hover:border-gray-400 focus:scale-[1.01] focus:border-slate-500 focus:ring-blue-500"
                  maxLength={NAMETAG_LENGTH_LIMIT}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
            </div>

            {/* Variant Select */}
            <div>
              <label
                htmlFor="nametag_type"
                className="block text-sm font-medium text-gray-700"
              >
                Variant
              </label>
              <div className="mt-1">
                <CustomSelect
                  templates={templates}
                  currentIndex={currentIndex}
                  setCurrentIndex={handleVariantChange}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Toggle Switches */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Preview Toggle */}
            {!isStandalonePWA() && (
              <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <span className="text-sm font-medium text-gray-700">
                  Preview
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {preview ? "Enabled" : "Disabled"}
                  </span>
                  <CustomSwitch
                    checked={preview}
                    setChecked={handlePreviewToggle}
                  />
                </div>
              </div>
            )}

            {/* Add T-Shirt Toggle */}
            <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
              <span className="text-sm font-medium text-gray-700">
                Add T-Shirt
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {addTShirt ? "Yes" : "No"}
                </span>
                <CustomSwitch
                  checked={addTShirt}
                  setChecked={handleAddTShirtToggle}
                />
              </div>
            </div>
          </div>

          {/* Row 3: T-Shirt ID Input (when enabled) */}
          <AnimatePresence>
            {addTShirt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div>
                  <label
                    htmlFor="tshirt_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    T-Shirt ID
                  </label>
                  <div className="mt-1 flex rounded-md shadow-xs">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                      roblox.com/catalog/
                    </span>
                    <motion.input
                      type="number"
                      name="tshirt_id"
                      id="tshirt_id"
                      className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 text-sm transition-all duration-200 hover:border-gray-400 focus:border-slate-500 focus:ring-blue-500"
                      min={1}
                      step={1}
                      defaultValue={currentTShirtID}
                      whileFocus={{ scale: 1.01 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      onChange={(e) => handleTShirtIDChange(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Indicator */}
      <AnimatePresence>
        {name.trim() && (
          <motion.div
            className="pt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="h-4 w-4"
                  >
                    <ArrowPathIcon className="h-4 w-4 text-blue-500" />
                  </motion.div>
                  <span className="text-blue-600">Generating nametag...</span>
                </>
              ) : shouldGenerate ? (
                <span className="text-green-600">
                  ✓ Nametag ready! Click to download.
                </span>
              ) : (
                <span className="text-gray-500">
                  Type to generate automatically
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default function GentagPage() {
  return <NametagForm />;
}
