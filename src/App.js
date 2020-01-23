import React from 'react';
import FlexBoxContainer from "./FlexBoxContainer";
import FlexBoxItem from "./FlexBoxItem";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Container, LinearProgress} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import MapNode, {equals} from "./Node";
import IconButton from "@material-ui/core/IconButton";
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import FastForwardIcon from '@material-ui/icons/FastForward';
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AppBar from "@material-ui/core/AppBar";
import {a11yProps, TabPanel} from "./ResultTabs";
import {nextRandom} from "./Functions";
import BFSWorkerFile from './BFSWorker.js';
import IDSWorkerFile from './IDSWorker.js';
import AStarWorkerFile from './AStarWorker.js';
import WebWorker from "./WebWorker";

const useStyle = makeStyles(theme => ({
    button: {
        width: 64,
        height: 64,
        margin: 10
    },
    searchButton: {
        margin: 10
    }
}));

export const availableStateColors = {
    empty: '#bbb88b',
    goal: '#4caf50',
    start: '#f50057',
    block: '#3f51b5',
};

export default function App() {
    const classes = useStyle();

    const resultPath = {0: [], 1: [], 2: []};

    const player = {interval: null};

    const [gameMapNodes, setGameMapNodes] = [[], []];
    const shouldResume = {Do: false};
    const playing = {is: false};

    for (let i = 0; i < 20; i++) {
        const [nodeRow, nodeRowSetter] = [[], []];
        for (let j = 0; j < 20; j++) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [node, setNode] = React.useState(new MapNode(availableStateColors.empty, i, j));
            nodeRow.push(node);
            nodeRowSetter.push(setNode);
        }
        gameMapNodes.push(nodeRow);
        setGameMapNodes.push(nodeRowSetter);
    }

    const availableSpeeds = [2000, 1000, 500, 250];
    const [playSpeed, setPlaySpeed] = React.useState(1);
    const [BFSWorker, setBFSWorker] = React.useState(null);
    const [AStarWorker, setAStarWorker] = React.useState(null);
    const [IDSWorker, setIDSWorker] = React.useState(null);

    React.useEffect(() => {

        const bfs = new WebWorker(BFSWorkerFile);
        bfs.onmessage = (event) => {
            const [path, time, expanded] = event.data;
            setPath(([, I, A]) => [path ? path : [], I, A]);
            setSearchTime(([, I, A]) => [time, I, A]);
            setExpandedNodeCount(([, I, A]) => [expanded, I, A]);
            setSearchCost(([, I, A]) => [path && path.length !== 0 ? path.length : '∞', I, A]);
            setSuccessful(([, I, A]) => [path && path.length !== 0, I, A]);
            setProgress(prevState => {
                switch (prevState) {
                    case 0:
                        return 33;
                    case 33:
                        return 66;
                    case 66:
                        return 100;
                    default:
                        return 0;
                }
            });
        };
        setBFSWorker(bfs);

        const ids = new WebWorker(IDSWorkerFile);
        ids.onmessage = (event) => {
            const [path, time, expanded] = event.data;
            setPath(([B, , A]) => [B, path ? path : [], A]);
            setSearchTime(([B, , A]) => [B, time, A]);
            setExpandedNodeCount(([B, , A]) => [B, expanded, A]);
            setSearchCost(([B, , A]) => [B, path && path.length !== 0 ? path.length : '∞', A]);
            setSuccessful(([B, , A]) => [B, path && path.length !== 0, A]);
            setProgress(prevState => {
                switch (prevState) {
                    case 0:
                        return 33;
                    case 33:
                        return 66;
                    case 66:
                        return 100;
                    default:
                        return 0;
                }
            });
        };
        setIDSWorker(ids);

        const aStar = new WebWorker(AStarWorkerFile);
        aStar.onmessage = (event) => {
            const [path, time, expanded] = event.data;
            setPath(([B, I,]) => [B, I, path ? path : []]);
            setSearchTime(([B, I,]) => [B, I, time]);
            setExpandedNodeCount(([B, I,]) => [B, I, expanded]);
            setSearchCost(([B, I,]) => [B, I, path && path.length !== 0 ? path.length : '∞']);
            setSuccessful(([B, I,]) => [B, I, path && path.length !== 0]);
            setProgress(prevState => {
                switch (prevState) {
                    case 0:
                        return 33;
                    case 33:
                        return 66;
                    case 66:
                        return 100;
                    default:
                        return 0;
                }
            });
        };
        setAStarWorker(aStar);

        return () => {
            bfs.terminate();
            ids.terminate();
            aStar.terminate();
        };
    }, []);

    const initialMap = () => {
        const array = Array(20);
        for (let i = 0; i < 20; i++) {
            array[i] = Array(20);
        }
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                array[i][j] = new MapNode(availableStateColors.empty, i, j, null);
            }
        }
        return array;
    };

    const [startNode, setStartNode] = React.useState(null);
    const [goalNode, setGoalNode] = React.useState(null);
    const [selectionMode, setSelectionMode] = React.useState(null);
    const [isPlaying, setPlaying] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    /////////////////////////////////////////////////////////////BFS, //IDS,///A* /////
    const [searchCost, setSearchCost] = React.useState(['N/A', "N/A", "N/A"]);
    const [searchTime, setSearchTime] = React.useState(['N/A', "N/A", "N/A"]);
    const [path, setPath] = React.useState([[], [], []]);
    const [expandedNodeCount, setExpandedNodeCount] = React.useState(['N/A', "N/A", "N/A"]);
    const [searched, setSearched] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [isSuccessful, setSuccessful] = React.useState([false, false, false]);
    // const [player, setPlayer] = React.useState(null);


    const play = () => {
        const currentPath = resultPath[value];
        let yet = false;
        for (let i = currentPath.length - 1; i >= 0; i--) {
            const {x, y, hasAgent} = currentPath[i];
            const {x: nodeX, y: nodeY, status} = gameMapNodes[x][y];
            if (!hasAgent) {
                const newNode = new MapNode(status, nodeX, nodeY, true);
                setGameMapNodes[x][y](newNode);
                currentPath[i] = newNode;
                yet = true;
                break;
            }
        }
        if (!yet) {
            shouldResume.Do = false;
            playing.is = false;
            setPlaying(prevState => false);
            clearInterval(player.interval);
            player.interval = null;
        }
    };

    const playPressed = () => {
        setErrorMessage('');
        if (playing.is) {
            return;
        }
        if (!searched) {
            setErrorMessage('Build your map and press "start search".');
            return;
        }
        if (path[value].length === 0) {
            setErrorMessage('Path not found (yet).');
            return;
        }
        if (!shouldResume.Do) {
            resultPath[0].length = 0;
            resultPath[1].length = 0;
            resultPath[2].length = 0;
            resultPath[0].push(...path[0]);
            resultPath[1].push(...path[1]);
            resultPath[2].push(...path[2]);
        }
        resume(availableSpeeds[playSpeed]);
    };

    const stopPressed = () => {
        setErrorMessage('');
        shouldResume.Do = true;
        stop();
    };

    const resume = (speed) => {
        player.interval = setInterval(play, speed);
        playing.is = true;
        setPlaying(true);
    };

    const reset = () => {
        stop();
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                const {status} = gameMapNodes[i][j];
                setGameMapNodes[i][j](new MapNode(status, i, j));
            }
        }
        resultPath[0].push(...path[0]);
        resultPath[1].push(...path[1]);
        resultPath[2].push(...path[2]);
    };

    const stop = () => {
        if (!isPlaying) {
            return;
        }
        setPlaying(prevState => false);
        clearInterval(player.interval);
        player.interval = null;
    };

    const onNodeClicked = (node) => {
        if (!selectionMode) {
            return;
        }
        setErrorMessage('');
        resetSearch();
        switch (selectionMode) {
            case 'start':
                if (equals(startNode, node)) {
                    return;
                } else if (node.status === availableStateColors.block) {
                    setErrorMessage('Cannot start from block.');
                    return;
                }
                if (startNode) {
                    setGameMapNodes[startNode.x][startNode.y](new MapNode(availableStateColors.empty, startNode.x, startNode.y));
                }
                const mapNode = new MapNode(availableStateColors.start, node.x, node.y);
                setGameMapNodes[node.x][node.y](mapNode);
                setStartNode(mapNode);
                break;
            case 'goal':
                if (equals(goalNode, node)) {
                    return;
                } else if (node.status === availableStateColors.block) {
                    setErrorMessage('Goal cannot be block.');
                    return;
                }
                if (goalNode) {
                    setGameMapNodes[goalNode.x][goalNode.y](new MapNode(availableStateColors.empty, goalNode.x, goalNode.y));
                }
                const mapNode1 = new MapNode(availableStateColors.goal, node.x, node.y);
                setGameMapNodes[node.x][node.y](mapNode1);
                setGoalNode(mapNode1);
                break;
            case 'block':
                if (equals(startNode, node)) {
                    setErrorMessage('Cannot start from block.');
                    return;
                }
                if (equals(goalNode, node)) {
                    setErrorMessage('Goal cannot be block.');
                    return;
                }
                if (node.status === availableStateColors.block) {
                    setGameMapNodes[node.x][node.y](new MapNode(availableStateColors.empty, node.x, node.y));
                    return;
                }
                setGameMapNodes[node.x][node.y](new MapNode(availableStateColors.block, node.x, node.y));
                break;
            default:
                break;
        }
    };

    const makeMap = () => {
        return (
            <FlexBoxContainer flexDirection='column'>
                {gameMapNodes.map((row, index) =>
                    <FlexBoxItem key={index}>
                        <FlexBoxContainer>
                            {row.map((node, index) =>
                                <FlexBoxItem key={index}>
                                    <IconButton
                                        style={{
                                            backgroundColor: node.status
                                        }}
                                        size='small'
                                        color='default'
                                        disableRipple
                                        onClick={() => onNodeClicked(node)}
                                        disableFocusRipple>
                                        <DirectionsRunIcon style={{
                                            color: node.hasAgent ? null : '#00000000'
                                        }}/>
                                    </IconButton>
                                </FlexBoxItem>
                            )}
                        </FlexBoxContainer>
                    </FlexBoxItem>
                )}
            </FlexBoxContainer>
        );
    };

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        shouldResume.Do = false;
        reset();
        setValue(newValue);
    };

    const startSearch = () => {
        setErrorMessage('');
        if (!goalNode || !startNode) {
            setErrorMessage('Select start and/or goal node first.');
            return;
        }
        setSelectionMode(null);
        // do search, then
        BFSWorker.postMessage([startNode, goalNode, gameMapNodes]);
        IDSWorker.postMessage([startNode, goalNode, gameMapNodes]);
        AStarWorker.postMessage([startNode, goalNode, gameMapNodes]);
        console.log('all searches started.');
        setSearched(true);
    };

    const increaseSpeed = () => {
        setErrorMessage('');
        if (playSpeed >= 3) {
            return;
        }
        const currentSpeed = playSpeed;
        stop();
        setPlaySpeed(prevState => prevState + 1);
        resume(availableSpeeds[currentSpeed + 1]);
    };

    const decreaseSpeed = () => {
        setErrorMessage('');
        if (playSpeed <= 0) {
            return;
        }
        const currentSpeed = playSpeed;
        stop();
        setPlaySpeed(prevState => prevState - 1);
        resume(availableSpeeds[currentSpeed - 1]);
    };

    const randomFillMap = () => {
        resetSearch();
        const blockCount = nextRandom();
        const randomStart = new MapNode(availableStateColors.start, nextRandom(0, 19), nextRandom(0, 19));
        let randomGoal = new MapNode(availableStateColors.goal, nextRandom(0, 19), nextRandom(0, 19));
        while (equals(randomStart, randomGoal)) {
            randomGoal = randomGoal = new MapNode(availableStateColors.goal, nextRandom(0, 19), nextRandom(0, 19));
        }
        const blocks = [];
        while (true) {
            if (blocks.length === blockCount) {
                break;
            }
            const nextBlock = new MapNode(availableStateColors.block, nextRandom(0, 19), nextRandom(0, 19));
            if (blocks.some(value1 => equals(value1, nextBlock)) || equals(randomStart, nextBlock) || equals(randomGoal, nextBlock)) {
                continue;
            }
            blocks.push(nextBlock);
        }
        const prevMap = [...initialMap()];
        prevMap[randomStart.x][randomStart.y] = randomStart;
        prevMap[randomGoal.x][randomGoal.y] = randomGoal;
        blocks.forEach(value1 => {
            prevMap[value1.x][value1.y] = value1;
        });
        prevMap.forEach((row, x) => row.forEach((node, y) => setGameMapNodes[x][y](node)));
        setStartNode(randomStart);
        setGoalNode(randomGoal);
    };

    const resetSearch = () => {
        resultPath[0] = [];
        resultPath[1] = [];
        resultPath[2] = [];
        setSearchCost(['N/A', "N/A", "N/A"]);
        setSearchTime(['N/A', "N/A", "N/A"]);
        setPath([[], [], []]);
        setExpandedNodeCount(['N/A', "N/A", "N/A"]);
        setSearched(false);
        setProgress(0);
        setSuccessful([false, false, false]);
    };

    return (
        <Container maxWidth='lg'>
            <FlexBoxContainer justifyContent='space-around' style={{
                marginTop: '10px'
            }}>
                {/* for algorithms and results */}
                <FlexBoxItem flexBasis={null}>
                    <FlexBoxContainer flexDirection='column' alignItems='center'>
                        <FlexBoxItem>
                            <Paper square>
                                <AppBar position="static">
                                    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                                        <Tab label="BFS" {...a11yProps(0)} />
                                        <Tab label="IDS" {...a11yProps(1)} />
                                        <Tab label="A*" {...a11yProps(2)} />
                                    </Tabs>
                                </AppBar>
                                <TabPanel value={value} index={0}>
                                    <FlexBoxContainer flexDirection='column'>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Search cost: {searchCost[0]}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Search
                                                time: {searchTime[0]} {searchTime[0] !== 'N/A' && 'milliseconds.'}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Expanded Nodes: {expandedNodeCount[0]}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Found path: {isSuccessful[0] ? 'Yes' : 'No'}
                                            </Typography>
                                        </FlexBoxItem>
                                    </FlexBoxContainer>
                                </TabPanel>
                                <TabPanel value={value} index={1}>
                                    <FlexBoxContainer flexDirection='column'>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Search cost: {searchCost[1]}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Search
                                                time: {searchTime[1]} {searchTime[1] !== 'N/A' && 'milliseconds.'}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Expanded Nodes: {expandedNodeCount[1]}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Found path: {isSuccessful[1] ? 'Yes' : 'No'}
                                            </Typography>
                                        </FlexBoxItem>
                                    </FlexBoxContainer>
                                </TabPanel>
                                <TabPanel value={value} index={2}>
                                    <FlexBoxContainer flexDirection='column'>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Search cost: {searchCost[2]}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Search
                                                time: {searchTime[2]} {searchTime[2] !== 'N/A' && 'milliseconds.'}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Expanded Nodes: {expandedNodeCount[2]}
                                            </Typography>
                                        </FlexBoxItem>
                                        <FlexBoxItem>
                                            <Typography variant='h6'>
                                                Found path: {isSuccessful[2] ? 'Yes' : 'No'}
                                            </Typography>
                                        </FlexBoxItem>
                                    </FlexBoxContainer>
                                </TabPanel>
                            </Paper>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                color='default'
                                onClick={startSearch}
                                className={classes.searchButton}
                                variant='contained'>
                                Start search
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem flexBasis={null}>
                            <LinearProgress value={progress} variant='determinate' placeholder={progress} style={{
                                width: '400px',
                                height: '10px'
                            }}/>
                        </FlexBoxItem>
                    </FlexBoxContainer>
                </FlexBoxItem>
                {/* for game map / options */}
                <FlexBoxItem flexBasis={null}>
                    <FlexBoxContainer flexDirection='column' alignItems='center'>
                        {/* for game map */}
                        <FlexBoxItem>
                            {makeMap()}
                        </FlexBoxItem>
                        {/* for play / stop buttons */}
                        <FlexBoxItem>
                            <FlexBoxContainer justifyContent='center'>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton onClick={decreaseSpeed}>
                                        <FastRewindIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton color={isPlaying ? 'default' : 'primary'} onClick={stopPressed}>
                                        <StopIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton color={isPlaying ? 'secondary' : 'default'} onClick={playPressed}>
                                        <PlayArrowIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                                <FlexBoxItem flexBasis={null}>
                                    <IconButton onClick={increaseSpeed}>
                                        <FastForwardIcon/>
                                    </IconButton>
                                </FlexBoxItem>
                            </FlexBoxContainer>
                        </FlexBoxItem>
                        {/* for Error messages */}
                        <FlexBoxItem>
                            <Typography variant='subtitle1' color='error'>
                                {errorMessage}
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
                                color={selectionMode === 'start' ? 'secondary' : 'default'}
                                onClick={() => {
                                    setErrorMessage('');
                                    if (isPlaying) {
                                        setErrorMessage("Stop playing first.");
                                        return;
                                    }
                                    setSelectionMode(selectionMode === 'start' ? null : 'start')
                                }}
                                variant='contained'>
                                S
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setErrorMessage('');
                                    if (isPlaying) {
                                        setErrorMessage("Stop playing first.");
                                        return;
                                    }
                                    setSelectionMode(selectionMode === 'goal' ? null : 'goal')
                                }}
                                className={classes.button}
                                style={{
                                    backgroundColor: selectionMode === 'goal' ? availableStateColors.goal : null
                                }}
                            >
                                G
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                variant='contained'
                                color={selectionMode === 'block' ? 'primary' : 'default'}
                                onClick={() => {
                                    setErrorMessage('');
                                    if (isPlaying) {
                                        setErrorMessage("Stop playing first.");
                                        return;
                                    }
                                    setSelectionMode(selectionMode === 'block' ? null : 'block')
                                }}
                                className={classes.button}>
                                B
                            </Button>
                        </FlexBoxItem>
                        <FlexBoxItem>
                            <Button
                                variant='contained'
                                onClick={() => {
                                    setErrorMessage('');
                                    if (isPlaying) {
                                        setErrorMessage("Stop playing first.");
                                        return;
                                    }
                                    randomFillMap();
                                }}
                                className={classes.button}>
                                Fill Random
                            </Button>
                        </FlexBoxItem>
                    </FlexBoxContainer>
                </FlexBoxItem>
            </FlexBoxContainer>
        </Container>
    );
}
