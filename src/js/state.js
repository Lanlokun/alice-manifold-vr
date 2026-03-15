// state.js
export let subjectData = [];
export let stimulusMeta = { name: null, duration: 0 };
export let driftHistory = [];

export const visibleSubjects = new Set();

export const state = {
    seeking: false,
    lastPos: {},
    lastTR: -1,
    peakDrift: 0,
    shellVisible: true
};

export const elements = {
    audio: null,
    timeline: null,
    volume: null,
    driftDisplay: null,
    peakDisplay: null,
    velocityDisplay: null,
    milestoneLabel: null,
    brainShell: null,
    brainSystem: null,
    traceContainer: null,
    cursorsContainer: null,
    vizContainer: null,
    playBtn: null
};

export let audioCtx = null;
export let analyser = null;
export let dataArray = null;
export let source = null;
export const bars = [];