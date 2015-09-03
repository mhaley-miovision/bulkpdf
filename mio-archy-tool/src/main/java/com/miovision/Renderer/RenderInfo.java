package com.miovision.Renderer;

/**
 * Created by vleipnik on 2015-09-01.
 */
public abstract class RenderInfo {
    protected double width;
    protected double height;

    RenderInfo(){
        this.width = 0;
        this.height = 0;
    }

    RenderInfo(double width, double height) {
        this.width = width;
        this.height = height;
    }

    public double width() {
        return width;
    }
    public double height() {
        return height;
    }
}
