import { v4 as uuidv4 } from "uuid";

export const generateInviteCode = () => {
    return uuidv4().replace(/-/g, "").substring(0, 6);
};

export const generateTaskCode = () => {
    return uuidv4().replace(/-/g, "").substring(0, 6);
};