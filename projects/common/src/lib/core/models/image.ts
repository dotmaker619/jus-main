/**
 * Model for image loading.
 */
export class ImageModel {
    /** Base64 string to display image. */
    public url: string;
    /** Css rotate property */
    public rotate: string;

    /**
     * @constructor
     * @param data Initialize data.
     */
    public constructor(data: Partial<ImageModel>) {
        this.url = data.url;
        this.rotate = data.rotate;
    }
}
