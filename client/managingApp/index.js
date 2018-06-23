import React from "react";

import ElmWrapper from "@client/components/ElmWrapper";
import { Managing } from "./elm/Managing/Main.elm";

const rootElementProps = {
    id: "main",
    className: "page-section",
    tabIndex: -1,
};

export default () => (
    <ElmWrapper rootElementProps={rootElementProps} src={Managing.Main} />
);
