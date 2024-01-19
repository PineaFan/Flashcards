
export interface User {
    id: string;
    name: string;
    image: string;
}
export interface DetailedUser extends User {
    email: string;
    ownedPacks: string[];
    savedPacks: string[];
}

export interface Pack {
    id: string;
    name: string;
    description: string;
    visibility: "public" | "unlisted" | "private";
    cards: Card[];
    color: string;
}

export interface Card {
    id: string;
    prompt: string;
    response: string;
}

export interface CardStates {
    [cardId: string]: "correct" | "almost" | "incorrect" | null;
}
