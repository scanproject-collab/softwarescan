import React from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Text, View, StyleSheet } from "react-native";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ],
  monthNamesShort: [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ],
  dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
};
LocaleConfig.defaultLocale = "pt-br";

interface DatePickerProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const DatePicker = ({ selectedDate, setSelectedDate }: DatePickerProps) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Data</Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: "#007AFF" } }}
        style={styles.calendar}
        firstDay={1}
        theme={{
          calendarBackground: "#fff",
          textSectionTitleColor: "#333",
          selectedDayBackgroundColor: "#007AFF",
          selectedDayTextColor: "#fff",
          todayTextColor: "#007AFF",
          dayTextColor: "#333",
          textDisabledColor: "#d9e1e8",
          monthTextColor: "#333",
          textMonthFontWeight: "bold",
        }}
      />
      <Text style={styles.hint}>* Selecione a data em que a foto foi tirada.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 16, marginBottom: 8 },
  calendar: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 12 },
  hint: { fontSize: 12, color: "#666", marginBottom: 12 },
});

export default DatePicker;