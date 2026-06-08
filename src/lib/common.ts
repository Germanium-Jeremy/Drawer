const TrancateText = (text: string, len: number = 10) => {
    if (text.length <= len) return text
    return text.slice(0, len) + '...'
}

export { TrancateText }