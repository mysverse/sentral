"use client";

import Image from "next/image";
import { useState } from "react";

import { ArrowPathIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import { useImageData, useNametagTemplates } from "components/swr";
import { isStandalonePWA } from "components/utils";
import { usePlausible } from "next-plausible";
import DefaultTransitionLayout from "components/transition";

const nametagLengthLimit = 12;

function NametagImage(
  name: string,
  index: number,
  preview: boolean = false,
  tShirtIDs: number[] = [],
  shouldTry: boolean
) {
  const shouldFetch =
    shouldTry &&
    name?.trim().length > 0 &&
    name.length <= nametagLengthLimit &&
    index >= 0;
  const { image, isLoading, isError } = useImageData(
    name,
    index,
    preview,
    tShirtIDs,
    shouldFetch
  );

  if (isError || isLoading) {
    return (
      <div className="h-full flex">
        <ArrowPathIcon
          className="h-16 w-16 m-auto text-slate-200"
          aria-hidden="true"
        />
      </div>
    );
  }

  const url = URL.createObjectURL(image);

  return (
    <div className="h-full flex">
      <a
        href={preview ? undefined : url}
        className="m-auto"
        download={`nametag_${name}`}
      >
        <div className="relative">
          <Image
            height={128}
            width={128}
            src={url}
            alt={`Nametag with name "${name}"`}
          />
          <div
            className="absolute"
            style={{
              width: "100%",
              height: "100%",
              top: 0,
              left: 0
            }}
          ></div>
        </div>
      </a>
    </div>
  );
}

function NametagForm() {
  const { templates, isError, isLoading } = useNametagTemplates(true);
  const [name, setName] = useState<string>("");
  const [changeFlag, setChangeFlag] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [pressed, setPressed] = useState<boolean>(false);
  const [preview, setPreview] = useState<boolean>(false);
  const [addTShirt, setAddTShirt] = useState<boolean>(false);
  const [currentTShirtID, setCurrentTShirtID] = useState<number>();
  const [tShirtIDs, setTShirtIDs] = useState<Array<number>>([]);

  const plausible = usePlausible();

  const image = NametagImage(
    name,
    currentIndex,
    preview,
    addTShirt ? tShirtIDs : [],
    pressed && !changeFlag
  );

  // if (isError || isLoading) {
  //   return null;
  // }

  return (
    <>
      <div className="relative block h-36 w-36 mb-8 border-2 border-gray-300 border-dashed rounded-lg">
        {image}
      </div>

      <form
        className="space-y-8 divide-y divide-gray-200"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Generate nametag
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter a name{" "}
                <span>
                  <ChevronRightIcon
                    className="inline h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
                <span>Select a nametag variant</span>
                <span>
                  <ChevronRightIcon
                    className="inline h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
                <span>Click the &quot;Generate&quot; button</span>
                <span>
                  <ChevronRightIcon
                    className="inline h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
                <span>
                  {preview
                    ? "Disable preview to save image"
                    : "Click the generated image to save "}
                </span>
                {!isStandalonePWA() ? (
                  <>
                    <span>
                      <ChevronRightIcon
                        className="inline h-4 w-4"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">
                      <a
                        href="https://create.roblox.com/dashboard/creations/upload?assetType=TShirt"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Upload to Roblox as T-Shirt
                      </a>
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="nametag_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Text
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="nametag_name"
                    id="nametag_name"
                    autoComplete="nametag_name"
                    placeholder="12 characters max"
                    className="shadow-sm focus:ring-slate-500 focus:border-slate-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    maxLength={12}
                    onChange={(e) => {
                      setName(e.target.value);
                      setChangeFlag(true);
                      setPressed(false);
                    }}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="nametag_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Variant
                </label>
                <div className="mt-1">
                  <select
                    id="nametag_type"
                    name="nametag_type"
                    autoComplete="nametag_type"
                    className="shadow-sm focus:ring-slate-500 focus:border-slate-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    onChange={(e) => {
                      const index = parseInt(e.target.value);
                      setCurrentIndex(index);
                      setChangeFlag(true);
                      setPressed(false);
                    }}
                    defaultValue={isLoading ? "hidden" : currentIndex}
                    disabled={!templates}
                  >
                    {templates ? (
                      templates.map((template, index) => (
                        <option key={index} value={index}>
                          {!isStandalonePWA()
                            ? template.name
                            : `Variant ${index + 1}`}
                        </option>
                      ))
                    ) : (
                      <option hidden disabled value="hidden">
                        Loading...
                      </option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200 pt-8 space-y-6 sm:pt-10 sm:space-y-5">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Options
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {!isStandalonePWA()
                  ? `See how your nametag looks on a shirt, or add another T-shirt
                layer (e.g. rank slides).`
                  : `Optionally, add any approved T-shirt layer from the catalog`}
              </p>
            </div>
            {!isStandalonePWA() ? (
              <>
                <div className="space-y-6 sm:space-y-5 divide-y divide-gray-200">
                  <div className="pt-6 sm:pt-5">
                    <div role="group" aria-labelledby="label-notifications">
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
                        <div>
                          <div
                            className="mb-3 text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700"
                            id="label-preview"
                          >
                            Preview
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="max-w-lg">
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <input
                                  id="preview-enable"
                                  name="preview"
                                  type="radio"
                                  className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300"
                                  checked={preview}
                                  value="enable"
                                  onChange={(e) =>
                                    setPreview(e.target.value === "enable")
                                  }
                                />
                                <label
                                  htmlFor="preview-enable"
                                  className="ml-3 block text-sm font-medium text-gray-700"
                                >
                                  Enabled
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id="preview-disable"
                                  name="preview"
                                  type="radio"
                                  className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300"
                                  checked={!preview}
                                  value="disable"
                                  onChange={(e) =>
                                    setPreview(e.target.value === "enable")
                                  }
                                />
                                <label
                                  htmlFor="preview-disable"
                                  className="ml-3 block text-sm font-medium text-gray-700"
                                >
                                  Disabled
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            <div className="space-y-6 sm:space-y-5 divide-y divide-gray-200">
              <div className="pt-6 sm:pt-5">
                <div role="group" aria-labelledby="label-notifications">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-baseline">
                    <div>
                      <div
                        className="mb-3 text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700"
                        id="label-addtshirt"
                      >
                        Add T-Shirt
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="max-w-lg">
                        {/* <p className="text-sm text-gray-500">
                          These are delivered via SMS to your mobile phone.
                        </p> */}
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              id="addtshirt-enable"
                              name="addtshirt"
                              type="radio"
                              className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300"
                              checked={addTShirt}
                              value="enable"
                              onChange={(e) =>
                                setAddTShirt(e.target.value === "enable")
                              }
                            />
                            <label
                              htmlFor="addtshirt-enable"
                              className="ml-3 block text-sm font-medium text-gray-700"
                            >
                              Yes
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="addtshirt-disable"
                              name="addtshirt"
                              type="radio"
                              className="focus:ring-slate-500 h-4 w-4 text-slate-600 border-gray-300"
                              checked={!addTShirt}
                              value="disable"
                              onChange={(e) =>
                                setAddTShirt(e.target.value === "enable")
                              }
                            />
                            <label
                              htmlFor="addtshirt-disable"
                              className="ml-3 block text-sm font-medium text-gray-700"
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {addTShirt ? (
              <>
                <div className="sm:mt-5 space-y-6 sm:space-y-5">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
                    <label
                      htmlFor="tshirt_id"
                      className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                    >
                      T-Shirt ID
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <div className="max-w-lg flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          roblox.com/catalog/
                        </span>
                        <input
                          type="number"
                          name="tshirt_id"
                          id="tshirt_id"
                          className="flex-1 block w-full focus:ring-slate-500 focus:border-slate-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                          min={1}
                          step={1}
                          defaultValue={currentTShirtID}
                          onChange={(e) => {
                            const id = parseInt(e.target.value);
                            setCurrentTShirtID(id);
                            // temp testing
                            setTShirtIDs([id]);
                            setChangeFlag(true);
                          }}
                        />
                        {/* <button
                          type="button"
                          onClick={(e) =>
                            currentTShirtID
                              ? !tShirtIDs.includes(currentTShirtID)
                                ? setTShirtIDs([...tShirtIDs, currentTShirtID])
                                : null
                              : null
                          }
                          className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                        >
                          Add
                        </button> */}
                      </div>
                      <div>
                        <ul>
                          {/* {tShirtIDs.map((item, key) => (
                            <li key={key}>{item}</li>
                          ))} */}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setPressed(true);
                setChangeFlag(false);
                plausible("gentagSubmit", {
                  props: {
                    name: name,
                    category: templates[currentIndex].name
                  }
                });
              }}
              disabled={!templates}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              Generate
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function GentagPage() {
  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <DefaultTransitionLayout show={true} appear={true}>
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
          <div className="rounded-lg">
            <NametagForm />
          </div>
        </div>
      </DefaultTransitionLayout>
    </div>
  );
}
