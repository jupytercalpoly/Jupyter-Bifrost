/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  Slider,
  Rail,
  Handles,
  Tracks,
  SliderItem,
  GetEventData,
} from 'react-compound-slider';
import { GetRailProps } from 'react-compound-slider/dist/types/Rail/types';
import { GetHandleProps } from 'react-compound-slider/dist/types/Handles/types';
import { GetTrackProps } from 'react-compound-slider/dist/types/Tracks/types';
import { BifrostTheme } from '../../theme';
import { Fragment, useCallback, useState } from 'react';

const sliderStyle = {
  position: 'relative',
  width: '100%',
};

interface RangeSliderProps {
  domain?: [number, number];
  value: number;
  step?: number;
  width?: number;
  onUpdate?(val: number): void;
  onSlideEnd?(val: number): void;
}

export default function RangeSlider({
  domain = [0, 100],
  value,
  width,
  step,
  onUpdate,
  onSlideEnd,
}: RangeSliderProps) {
  return (
    <div
      className="RangeSlider"
      css={css`
        width: 100%;
        padding: 12px;
        width: ${width}px;
      `}
    >
      <Slider
        className="range-slider"
        mode={1}
        step={step}
        domain={domain}
        rootStyle={sliderStyle}
        onUpdate={(vals) => onUpdate?.(vals[0])}
        onSlideEnd={(vals) => onSlideEnd?.(vals[0])}
        values={[value]}
      >
        <Rail>{(props) => <SliderRail {...props} />}</Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map((handle) => (
                <Handle
                  key={handle.id}
                  handle={handle}
                  domain={domain}
                  getHandleProps={getHandleProps}
                />
              ))}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks.map(({ id, source, target }) => (
                <Track
                  key={id}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>
      </Slider>
    </div>
  );
}

// *******************************************************
// Tooltip
// *******************************************************

interface TooltipProps {
  value: number | null;
  percent: number | null;
}

function Tooltip(props: TooltipProps) {
  const tooltipCss = css`
    left: ${props.percent}%;
    position: absolute;
    margin-left: -11px;
    margin-top: -35px;
    padding: 10px;
  `;
  return (
    <div className="Tooltip" css={tooltipCss}>
      {props.value}
    </div>
  );
}

// *******************************************************
// RAIL
// *******************************************************

const railCss = (theme: BifrostTheme) => css`
  position: absolute;
  width: 100%;
  height: 3px;
  transform: translate(0%, -50%);
  border-radius: 7px;
  cursor: pointer;
  background: ${theme.color.primary.light};
`;

const tooltipRailCss = css`
  position: absolute;
  width: 100%;
  height: 15px;
  transform: translate(0%, -50%);
  cursor: pointer;
  z-index: 20;
`;

interface SliderRailProps {
  activeHandleID: string;
  getRailProps: GetRailProps;
  getEventData: GetEventData;
}

function SliderRail({
  activeHandleID,
  getRailProps,
  getEventData,
}: SliderRailProps) {
  const [tooltipState, setTooltipState] = useState<TooltipProps>({
    value: null,
    percent: null,
  });

  /**
   * Update the tooltip value
   */
  const onMouseMove = useCallback((e: MouseEvent) => {
    setTooltipState(
      activeHandleID ? { value: null, percent: null } : getEventData(e)
    );
  }, []);
  /**
   * Attach events for tooltip
   */
  function onMouseEnter() {
    document.addEventListener('mousemove', onMouseMove);
  }
  /**
   * Remove tooltip events
   */
  function onMouseLeave() {
    setTooltipState({ value: null, percent: null });
    document.removeEventListener('mousemove', onMouseMove);
  }

  return (
    <Fragment>
      <Tooltip {...tooltipState} />
      <div
        className="tooltip-rail"
        css={tooltipRailCss}
        {...getRailProps({
          onMouseEnter,
          onMouseLeave,
        })}
      />
      <div className="rail" css={railCss} />
    </Fragment>
  );
  // <div/>
}

// *******************************************************
// HANDLE COMPONENT
// *******************************************************

interface HandleProps {
  domain: [number, number];
  handle: SliderItem;
  disabled?: boolean;
  getHandleProps: GetHandleProps;
}

function Handle({
  domain: [min, max],
  handle: { id, value, percent },
  disabled = false,
  getHandleProps,
}: HandleProps) {
  const handleCss = (theme: BifrostTheme) => css`
    left: ${percent}%;
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 2;
    width: 15px;
    height: 15px;

    border-radius: 50%;
    border: 1px solid ${theme.color.primary.dark};
    box-shadow: ${theme.shadow.handle};
    background-color: ${disabled
      ? theme.color.primary.light
      : theme.color.primary.standard};
  `;

  return (
    <div
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      css={handleCss}
      className="handle-2"
      {...getHandleProps(id)}
    />
  );
}

// *******************************************************
// TRACK COMPONENT
// *******************************************************

interface TrackProps {
  source: SliderItem;
  target: SliderItem;
  getTrackProps: GetTrackProps;
  disabled?: boolean;
}

function Track({
  source,
  target,
  getTrackProps,
  disabled = false,
}: TrackProps) {
  return (
    <div
      className="track"
      css={(theme) => css`
        position: absolute;
        transform: translate(0%, -50%);
        height: 7px;
        z-index: 1;
        background-color: ${theme.color.primary.light};
        border-radius: 7px;
        cursor: pointer;
        left: ${source.percent}%;
        width: ${target.percent - source.percent}%;
      `}
      {...getTrackProps()}
    />
  );
}
