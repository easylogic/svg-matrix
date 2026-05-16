import { defineClientConfig } from "vuepress/client";
import LessonDemo from "./components/LessonDemo.vue";

export default defineClientConfig({
  enhance({ app }) {
    app.component("LessonDemo", LessonDemo);
  }
});
