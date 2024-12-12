// Defines the messages exchanged between Devvit and Web View
export type WebViewMessage =
| {
    type: 'initialData';
    data: { username: string };
}
| {
    type: 'completion';
    data: { time: number };
}
| {
    type: 'alert';
    message: string;
}
;