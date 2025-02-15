"use client";

import { AnimateNumber } from "motion-number";
import { useMotionValue, useSpring, useVelocity } from "motion/react";
import { Slider } from "radix-ui";
import { useEffect, useState } from "react";

export default function NumberSlider({
  min = 0,
  max = 100,
  name,
  initialValue = 50,
  onChange
}: {
  min?: number;
  max?: number;
  name?: string;
  initialValue?: number;
  onChange?: (value: number) => void;
}) {
  // Radix slider expects the value to be an array of numbers.
  const [value, setValue] = useState([initialValue]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(initialValue.toString());

  const scaled = useMotionValue(scale(value[0]));
  const velocity = useVelocity(scaled);
  // const rotate = useSpring(velocity);

  useEffect(() => {
    scaled.set(scale(value[0]));
    onChange?.(value[0]);
  }, [value, scaled, onChange]);

  // Commit the edited value by clamping between min and max.
  const commitEditing = () => {
    let newValue = Number(editingValue);
    if (isNaN(newValue)) newValue = min;
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    setValue([newValue]);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-row items-center gap-3 sm:gap-4">
      {isEditing ? (
        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={commitEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEditing();
          }}
          autoFocus
          className="h-10 w-24 rounded bg-blue-500 text-center text-[#f5f5f5]"
        />
      ) : (
        <div
          onClick={() => {
            setIsEditing(true);
            setEditingValue(value[0].toString());
          }}
        >
          <AnimateNumber
            transition={{ duration: 0.2, ease: "easeOut" }}
            locales="en-US"
            className="flex h-10 w-16 items-center justify-center rounded bg-blue-500 text-[#f5f5f5]"
            style={{ originX: 0.5, originY: 1.5 }}
          >
            {value as any}
          </AnimateNumber>
        </div>
      )}

      <Slider.Root
        className="relative flex h-12 w-full touch-none items-center select-none"
        name={name}
        onValueChange={setValue}
        value={value}
        defaultValue={[initialValue]}
        min={min}
        max={max}
        step={1}
        disabled={isEditing}
      >
        <Slider.Track className="relative h-[3px] flex-grow rounded-full bg-gray-200">
          <Slider.Range className="absolute h-full rounded-full bg-gray-200" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-[20px] w-[20px] rounded-full bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Amount"
        />
      </Slider.Root>
    </div>
  );
}

/**
 * ==============   Utils   ================
 */

function scale(value: number, scaleBy: number = -0.1) {
  return value * scaleBy;
}
