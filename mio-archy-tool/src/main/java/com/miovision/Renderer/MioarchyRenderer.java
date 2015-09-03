package com.miovision.Renderer;

import com.miovision.Model.Job;
import com.miovision.Model.Mioarchy;
import com.miovision.Model.Organization;
import com.mxgraph.canvas.mxGraphicsCanvas2D;
import com.mxgraph.io.mxCodec;
import com.mxgraph.util.mxCellRenderer;
import com.mxgraph.util.mxUtils;
import com.mxgraph.util.mxXmlUtils;
import com.mxgraph.view.mxGraph;
import org.w3c.dom.Document;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;

public class MioarchyRenderer
{
    public void test(Mioarchy mioarchy)
    {
        System.out.println("Rendering Mioarchy...");

        //SAXParserFactory parserFactory = SAXParserFactory.newInstance();
        String inFile = "/Users/vleipnik/Downloads/input.xml";
        String outFile = "/Users/vleipnik/Downloads/output.xml";
        String outImage = "/Users/vleipnik/Downloads/output.png";

        try {
            mxGraph graph = new mxGraph();

            // Parses XML into graph
            Document doc = mxXmlUtils.parseXml(mxUtils.readFile(inFile));
            mxCodec codec = new mxCodec(doc);
            //codec.decode(doc.getDocumentElement(), graph.getModel());
            codec.decode(doc, graph.getModel());

            // create the rendering information
            RenderInfoOrganization ri = new RenderInfoOrganization(
                    mioarchy.organizationByName("Data Extraction System"), mioarchy);
            // perform the render!
            ri.render(0, 0, graph);

            java.io.File file = new File(outImage);
            BufferedImage image = mxCellRenderer.createBufferedImage(graph, null, 1, Color.WHITE, true, null);
            ImageIO.write(image, "PNG", file);

            mxUtils.writeFile(mxXmlUtils.getXml(codec.encode(graph.getModel())), outFile);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("Finished rendering!");
    }
}
