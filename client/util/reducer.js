import {
    UT_GET_PUBLIC_SETTINGS,
    UT_GET_PUBLIC_SETTINGS_DELTA,
    UT_DISPLAY_ANNOUNCEMENT,
    UT_HIDE_ANNOUNCEMENT,
} from "./actions";

const INITIAL_UTIL_STATE = {
    isAnnouncementDisplayed: false,
    settings: {
        applicationMainHomePictureLink: "",
        applicationTitle: "math-emporium",
        faqContent: void 0,
        announcementContent: "",
        announcementBackgroundColor: "",
        announcementTextColor: "",
    },
};

export default function utilReducer(state = INITIAL_UTIL_STATE, action) {
    switch (action.type) {
        case UT_GET_PUBLIC_SETTINGS:
            if (action.payload instanceof Object) {
                return { ...state, settings: action.payload };
            }
            return state;
        case UT_GET_PUBLIC_SETTINGS_DELTA:
            if (action.payload instanceof Object) {
                return {
                    ...state,
                    settings: { ...state.settings, ...action.payload },
                };
            }
            return state;
        case UT_DISPLAY_ANNOUNCEMENT:
            return { ...state, isAnnouncementDisplayed: true };
        case UT_HIDE_ANNOUNCEMENT:
            return { ...state, isAnnouncementDisplayed: false };
        default:
            return state;
    }
}
