import React from 'react';
import FlexBoxContainer from "./FlexBoxContainer";
import FlexBoxItem from "./FlexBoxItem";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Container} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import MapNode from "./Node";
import IconButton from "@material-ui/core/IconButton";
import {Add} from "@material-ui/icons";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import FastForwardIcon from '@material-ui/icons/FastForward';

const useStyle = makeStyles(theme => ({
    button: {
        width: 40,
        height: 40,
        maxWidth: 40,
        maxHeight: 40,
        margin: 2
    },
    gameButton: {
        root: {
            width: 40,
            height: 40,
            margin: 2
        }
    }
}));

const availableStates = {
    empty: 'empty',
    goal: 'goal',
    start: 'start',
    block: 'block',
};

export default function App() {
    const classes = useStyle();

    const initialMap = () => {
        const array = Array(20);
        for (let i = 0; i < 20; i++) {
            array[i] = Array(20);
        }
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                array[i][j] = new MapNode(availableStates.empty, i, j, null);
            }
        }
        return array;
    };

    const [gameMap, setGameMap] = React.useState(initialMap());

    const makeMap = () => {
        return (
            <FlexBoxContainer flexDirection='column'>
                {gameMap.map(row =>
                    <FlexBoxItem>
                        <FlexBoxContainer>
                            {row.map(node =>
                                <FlexBoxItem>
                                    <IconButton style={{
                                        backgroundColor: 'red'
                                    }} size='small' color='primary' disableRipple disableFocusRipple>
                                        <Add/>
                                    </IconButton>
                                </FlexBoxItem>
                            )}
                        </FlexBoxContainer>
                    </FlexBoxItem>
                )}
            </FlexBoxContainer>
        );
    };

    return (
        <Container maxWidth='xl'>
            <FlexBoxContainer justifyContent='space-around' style={{
                marginTop: '10px'
            }}>
                {/* for algorithms */}
                <FlexBoxItem flexBasis={null}>
                    <FlexBoxContainer flexDirection='column'>
                        <FlexBoxItem>
                            <Button
                                className={classes.button}
                                variant='contained'>
                                A*
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                variant='contained'
                                className={classes.button}>
                                BFS
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                variant='contained'
                                className={classes.button}>
                                IDS
                            </Button>
                        </FlexBoxItem>
                    </FlexBoxContainer>
                </FlexBoxItem>
                {/* for game map / options */}
                <FlexBoxItem flexBasis={null}>
                    <FlexBoxContainer flexDirection='column'>
                        {/* for game map */}
                        <FlexBoxItem>
                            {makeMap()}
                        </FlexBoxItem>
                        {/* for play / stop buttons */}
                        <FlexBoxItem>
                            <FlexBoxContainer justifyContent='center'>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton>
                                        <FastRewindIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton>
                                        <StopIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton>
                                        <PlayArrowIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton>
                                        <FastForwardIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                            </FlexBoxContainer>
                        </FlexBoxItem>
                        {/* for Error messages */}
                        <FlexBoxItem>
                            <Typography variant='h6'>
                                No errors yet!
                            </Typography>
                        </FlexBoxItem>
                    </FlexBoxContainer>
                </FlexBoxItem>
                {/* for map block types */}
                <FlexBoxItem flexBasis={null}>
                    <FlexBoxContainer flexDirection='column'>
                        <FlexBoxItem>
                            <Button
                                className={classes.button}
                                variant='contained'>
                                S
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                variant='contained'
                                className={classes.button}>
                                G
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                variant='contained'
                                className={classes.button}>
                                B
                            </Button>
                        </FlexBoxItem>
                    </FlexBoxContainer>
                </FlexBoxItem>
            </FlexBoxContainer>
        </Container>
    );
}
