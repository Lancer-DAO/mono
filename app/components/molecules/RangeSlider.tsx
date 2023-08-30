import Image from "next/image";
import { FC, useState } from "react";
import { Range, getTrackBackground } from "react-range";

const STEP = 5;

interface LabeledTwoThumbsProps {
  bounds: [number, number];
  setBounds: (bounds: [number, number]) => void;
}

export const RangeSlider: FC<LabeledTwoThumbsProps> = ({
  bounds,
  setBounds,
}) => {
  const MIN = bounds[0];
  const MAX = bounds[1];
  const [values, setValues] = useState<[number, number]>([MIN, MAX]);
  return (
    <Range
      values={values}
      step={STEP}
      min={MIN}
      max={MAX}
      onChange={(values) => {
        setValues(values as [number, number]);
        setBounds(values as [number, number]);
      }}
      renderTrack={({ props, children }) => (
        <div
          onMouseDown={props.onMouseDown}
          onTouchStart={props.onTouchStart}
          style={{
            ...props.style,
            height: "36px",
            display: "flex",
            width: "100%",
          }}
        >
          <div
            ref={props.ref}
            style={{
              height: "5px",
              width: "100%",
              borderRadius: "4px",
              background: getTrackBackground({
                values,
                colors: ["#ccc", "#40B816", "#ccc"],
                min: MIN,
                max: MAX,
              }),
              alignSelf: "center",
            }}
          >
            {children}
          </div>
        </div>
      )}
      renderThumb={({ index, props, isDragged }) => (
        <div
          {...props}
          style={{
            ...props.style,
            height: "25px",
            width: "25px",
            borderRadius: "100%",
            backgroundColor: "#FFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0px 2px 6px #AAA",
          }}
        >
          {isDragged && (
            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "14px",
                padding: "4px",
                borderRadius: "4px",
                backgroundColor: "#40B816",
              }}
            >
              {`$${values[index].toFixed(0)}`}
            </div>
          )}
          <Image
            src="/assets/images/lancer-logo.png"
            width={15}
            height={15}
            alt="Industry Trio"
          />
        </div>
      )}
    />
  );
};
