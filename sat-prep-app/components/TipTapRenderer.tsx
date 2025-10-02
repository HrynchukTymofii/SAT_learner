import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import MathView from "react-native-math-view";

// --- Render text marks like bold, italic, colors, fonts
function RenderText({ text, marks = [] }: { text: string; marks?: any[] }) {
  const style: any = {};

  marks.forEach((mark) => {
    if (mark.type === "bold") style.fontWeight = "bold";
    if (mark.type === "italic") style.fontStyle = "italic";
    if (mark.type === "textStyle") {
      const attrs = mark.attrs || {};
      if (attrs.color) style.color = attrs.color;
      if (attrs.fontSize) style.fontSize = attrs.fontSize;
      if (attrs.fontFamily) style.fontFamily = attrs.fontFamily;
      if (attrs.backgroundColor) style.backgroundColor = attrs.backgroundColor;
      if (attrs.lineHeight) style.lineHeight = attrs.lineHeight;
    }
  });

  return <Text style={style}>{text}</Text>;
}

// --- Render each TipTap node
function RenderNode({ node }: { node: any }) {
  switch (node.type) {
    case "paragraph":
      return (
        <View style={styles.paragraph}>
          {node.content?.map((child: any, idx: number) => (
            <RenderNode key={idx} node={child} />
          ))}
        </View>
      );
    case "heading":
      const sizeMap: Record<number, number> = { 1: 28, 2: 24, 3: 20, 4: 18, 5: 16, 6: 14 };
      return (
        <Text style={[styles.heading, { fontSize: sizeMap[node.attrs.level] || 16 }]}>
          {node.content?.map((child: any, idx: number) => (
            <RenderNode key={idx} node={child} />
          ))}
        </Text>
      );
    case "text":
      return <RenderText text={node.text} marks={node.marks} />;
    case "inlineMath":
        console.log(node.attrs.latex)
        const latex = node.attrs.latex;
        const hasTallSymbols = /\\tfrac|\\sum|\\int|\\prod/.test(latex);
        const verticalMargin = hasTallSymbols ? 4 : 4;
        const height = hasTallSymbols ? 40 : 20;
      return <MathView math={node.attrs.latex} inline={true} style={{ marginVertical: verticalMargin, minHeight: height }} resizeMode="cover"
  mathFontSize={20} />;
    case "image":
      return (
        <Image
          source={{ uri: node.attrs.src }}
          style={{
            width: node.attrs.width || "100%",
            height: node.attrs.height || 200,
            marginVertical: 8,
          }}
        />
      );
    default:
      return null;
  }
}

// --- Main Renderer
export default function TipTapRenderer({ content }: { content: any }) {
  return (
    <View style={styles.container}>
      {content.content.map((node: any, idx: number) => (
        <RenderNode key={idx} node={node} />
      ))}
    </View>
  );
}

// --- Styles
const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 8 },
  paragraph: { marginBottom: 8, lineHeight: 22 },
  heading: { fontWeight: "bold", marginVertical: 6 },
  math: { marginVertical: 4, },
});
