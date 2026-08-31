import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1c1917",
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 11,
    color: "#4f46e5",
    marginBottom: 4,
  },
  meta: {
    fontSize: 9,
    color: "#78716c",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 6,
    color: "#1c1917",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e4db",
    paddingBottom: 3,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.45,
    marginBottom: 4,
  },
  role: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  period: {
    fontSize: 9,
    color: "#78716c",
    marginBottom: 3,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.4,
    marginLeft: 8,
    marginBottom: 2,
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.4,
  },
});

export function ResumeDocument({ resume, version }) {
  const basics = version?.parsedSections?.basics || {};
  const summary = version?.parsedSections?.summary || "";
  const experience = version?.parsedSections?.experience || [];
  const education = version?.parsedSections?.education || [];
  const skills = version?.parsedSections?.skills || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{basics.name || "Candidate"}</Text>
        {basics.title && <Text style={styles.title}>{basics.title}</Text>}
        <Text style={styles.meta}>
          {[basics.email, basics.location].filter(Boolean).join("  ·  ")}
        </Text>

        {/* Summary */}
        {summary && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.body}>{summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.role}>
                  {exp.role} · {exp.company}
                </Text>
                <Text style={styles.period}>{exp.period}</Text>
                {exp.bullets?.map((b, j) => (
                  <Text key={j} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((ed, i) => (
              <View key={i} style={{ marginBottom: 4 }}>
                <Text style={styles.role}>
                  {ed.degree} · {ed.school}
                </Text>
                <Text style={styles.period}>{ed.period}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{skills.join("  ·  ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}