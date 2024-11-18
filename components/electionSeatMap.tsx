export default function ElectionSeatMap({ colours }: { colours: string[] }) {
  const getColour = (index: number) => {
    return colours[index] || "grey";
  };
  return (
    <svg width="100%" height="100%" viewBox="0 0 360 185">
      <g>
        <g id="0_Party-1">
          <circle cx="22.23" cy="166.70" r="13.33" fill={getColour(0)} />
          <circle cx="55.71" cy="166.72" r="13.33" fill={getColour(1)} />
          <circle cx="89.29" cy="166.76" r="13.33" fill={getColour(2)} />
          <circle cx="30.31" cy="128.41" r="13.33" fill={getColour(3)} />
          <circle cx="66.48" cy="127.68" r="13.33" fill={getColour(4)} />
          <circle cx="47.53" cy="93.27" r="13.33" fill={getColour(5)} />
          <circle cx="105.41" cy="126.72" r="13.33" fill={getColour(6)} />
          <circle cx="89.16" cy="94.13" r="13.33" fill={getColour(7)} />
          <circle cx="72.85" cy="63.43" r="13.33" fill={getColour(8)} />
          <circle cx="104.71" cy="40.71" r="13.33" fill={getColour(9)} />
          <circle cx="121.38" cy="69.60" r="13.33" fill={getColour(10)} />
          <circle cx="138.05" cy="98.49" r="13.33" fill={getColour(11)} />
          <circle cx="141.17" cy="26.50" r="13.33" fill={getColour(12)} />
          <circle cx="159.75" cy="56.65" r="13.33" fill={getColour(13)} />
          <circle cx="180.00" cy="88.33" r="13.33" fill={getColour(14)} />
          <circle cx="180.00" cy="21.67" r="13.33" fill={getColour(15)} />
          <circle cx="200.25" cy="56.65" r="13.33" fill={getColour(16)} />
          <circle cx="218.83" cy="26.50" r="13.33" fill={getColour(17)} />
          <circle cx="221.95" cy="98.49" r="13.33" fill={getColour(18)} />
          <circle cx="238.62" cy="69.60" r="13.33" fill={getColour(19)} />
          <circle cx="255.29" cy="40.71" r="13.33" fill={getColour(20)} />
          <circle cx="287.15" cy="63.43" r="13.33" fill={getColour(21)} />
          <circle cx="270.84" cy="94.13" r="13.33" fill={getColour(22)} />
          <circle cx="254.59" cy="126.72" r="13.33" fill={getColour(23)} />
          <circle cx="312.47" cy="93.27" r="13.33" fill={getColour(24)} />
          <circle cx="293.52" cy="127.68" r="13.33" fill={getColour(25)} />
          <circle cx="329.69" cy="128.41" r="13.33" fill={getColour(26)} />
          <circle cx="270.71" cy="166.76" r="13.33" fill={getColour(27)} />
          <circle cx="304.29" cy="166.72" r="13.33" fill={getColour(28)} />
          <circle cx="337.77" cy="166.70" r="13.33" fill={getColour(29)} />
        </g>
      </g>
    </svg>
  );
}
