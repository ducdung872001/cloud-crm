export const imagesSize = {
    cover: 864,
    content: 600,
    postAvatar: 60,
    previewLink: 120,
    profileAvatar: 200,
    sessionCover: 915,
    ads_banner: 560
};

export const replaceImageURL = (data, type, size) => {
    if (data) {
        let replacedData = data.replace(
            /(http|https):\/\/(10\.240\.152\.161:8080|dev8080\.api\.noron\.vn)/g,
            'https://cdn.noron.vn'
        );
        const matches = replacedData.match(
            /https?:\/\/cdn.noron.vn\/(.+?)\.(jpg|jpeg|png)\/*(\?w=[0-9]+)?/g
        );
        if (matches) {
            matches.map(imageURL => {
                const cdnMatched = imageURL.match(
                    /(https?:\/\/cdn\.noron\.vn.*\.(jpg|jpeg|png))(\?w=[0-9]+)?/
                );
                if (cdnMatched && cdnMatched[1]) {
                    replacedData = replacedData.replace(
                        imageURL,
                        `${cdnMatched[1]}?w=${size || imagesSize[type]}`
                    );
                }
            });
        }

        return replacedData;
    }

    return data;
};