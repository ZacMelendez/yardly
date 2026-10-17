export function openInMaps(address: string) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
        // Try Apple Maps first
        const mapsUrl = `maps://?address=${encodeURIComponent(address)}`;
        window.location.href = mapsUrl;
        return address;
    } else {
        // Fallback to Google Maps web version
        const googleUrl = `https://maps.google.com/?q=${encodeURIComponent(
            address
        )}`;
        window.open(googleUrl, "_blank");
        return address;
    }
}
