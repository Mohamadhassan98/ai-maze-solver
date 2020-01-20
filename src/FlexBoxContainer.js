import React from "react";
import {Box} from "@material-ui/core";
import PropTypes from 'prop-types';

export default function FlexBoxContainer(props) {
    const {alignItemsSafety, alignContentSafety, justifyContentSafety, justifyItemsSafety, ...other} = props;
    const {alignContent, alignItems, justifyContent, justifyItems} = other;
    const alignItemsSafetyOff = alignItemsSafety === 'off' || !['start', 'flex-start', 'self-start', 'end', 'flex-end', 'self-end', 'center'].includes(alignItems);
    const alignContentSafetyOff = alignContentSafety === 'off' || !['start', 'flex-start', 'end', 'flex-end', 'center'].includes(alignContent);
    const justifyContentSafetyOff = justifyContentSafety === 'off' || !['start', 'flex-start', 'end', 'flex-end', 'center', 'left', 'right'].includes(justifyContent);
    const justifyItemsSafetyOff = justifyItemsSafety === 'off' || !['start', 'flex-start', 'self-start', 'end', 'flex-end', 'self-end', 'center', 'left', 'right'].includes(justifyItems);
    const computedProps = {
        ...other,
        alignItems: alignItemsSafetyOff ? alignItems : `${alignItemsSafety} ${alignItems}`,
        alignContent: alignContentSafetyOff ? alignContent : `${alignContentSafety} ${alignContent}`,
        justifyContent: justifyContentSafetyOff ? justifyContent : `${justifyContentSafety} ${justifyContent}`,
        justifyItems: justifyItemsSafetyOff ? justifyItems : `${justifyItemsSafety} ${justifyItems}`
    };

    return (
        <Box {...computedProps}>
            {props.children}
        </Box>
    );
}

FlexBoxContainer.propTypes = {
    ...Box.propTypes,
    display: PropTypes.oneOf(['flex', 'inline-flex']),
    flexDirection: PropTypes.oneOf(['row', 'row-reverse', 'column', 'column-reverse']),
    flexWrap: PropTypes.oneOf(['nowrap', 'wrap', 'wrap-reverse']),
    justifyContent: PropTypes.oneOf(['flex-start', 'flex-end', 'start', 'end', 'left', 'right', 'center', 'space-between', 'space-around', 'space-evenly', 'normal', 'stretch']),
    justifyContentSafety: PropTypes.oneOf(['safe', 'unsafe', 'off']),
    alignItems: PropTypes.oneOf(['stretch', 'flex-start', 'start', 'self-start', 'flex-end', 'end', 'self-end', 'center', 'baseline', 'first baseline', 'last baseline', 'normal']),
    alignItemsSafety: PropTypes.oneOf(['safe', 'unsafe', 'off']),
    alignContent: PropTypes.oneOf(['stretch', 'flex-start', 'start', 'flex-end', 'end', 'center', 'baseline', 'first baseline', 'last baseline', 'space-between', 'space-around', 'space-evenly', 'normal']),
    alignContentSafety: PropTypes.oneOf(['safe', 'unsafe', 'off']),
    justifyItems: PropTypes.oneOf(['stretch', 'flex-start', 'start', 'self-start', 'flex-end', 'end', 'self-end', 'center', 'baseline', 'first baseline', 'last baseline', 'normal', 'left', 'right', 'auto']),
    justifyItemsSafety: PropTypes.oneOf(['safe', 'unsafe', 'off'])
};

FlexBoxContainer.defaultProps = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    justifyContentSafety: 'safe',
    alignItems: 'stretch',
    alignItemsSafety: 'safe',
    alignContent: 'stretch',
    alignContentSafety: 'safe',
    justifyItems: 'stretch',
    justifyItemsSafety: 'safe'
};