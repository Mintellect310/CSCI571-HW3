export const formatNumber = (number) => parseFloat(number.toFixed(2)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const dateFormat = (timestamp) => new Date(timestamp*1000).toLocaleDateString("en-US", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
