export const capitalize = (input: string): string => {
    const words = input.split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()).join(' ');
}

export const batchSettings = {
    maxMessages: 1,
    maxMilliSeconds: 1
}