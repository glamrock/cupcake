How to use this:

First, let's import the needed files.

    Option 1: Import Flex-Iframe swc (or pom) into your project from Maven. 
            Drop that entire folder into /libs manually.
    Option 2: Add this dependency:
            <dependency>
              <groupId>com.google.code.flex-iframe</groupId>
              <artifactId>flex-iframe</artifactId>
              <version>1.5.1</version>
            </dependency>

Done that? Fantastic. Now add the iframe:

    <mx:Application xmlns:mx="http://www.adobe.com/2006/mxml"
                    xmlns:flexiframe="http://code.google.com/p/flex-iframe/">
    
        <flexiframe:IFrame id="googleIFrame"
                           label="Google"
                           source="//crypto.stanford.edu/flashproxy/embed.html?debug&initial_facilitator_poll_interval=5"
                           width="1px"
                           height="1px"/>
    <mx:Application>
    
