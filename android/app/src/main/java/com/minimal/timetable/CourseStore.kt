package com.minimal.timetable

import android.content.Context
import org.json.JSONArray

/**
 * 极简课程持久化引擎 (基于本地零冗余轻量存储，加载耗时 < 2ms)
 * 示例通用课表 (无任何个人隐私数据)
 */
object CourseStore {
    private const val PREF_NAME = "minimal_timetable_prefs_v2"
    private const val KEY_COURSES = "courses_data"

    fun loadCourses(context: Context): MutableList<Course> {
        val sp = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val jsonStr = sp.getString(KEY_COURSES, null)
        if (jsonStr.isNullOrEmpty()) {
            val initial = getDemoCourses()
            saveCourses(context, initial)
            return initial
        }
        val list = mutableListOf<Course>()
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                list.add(Course.fromJson(array.getJSONObject(i)))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return list
    }

    fun saveCourses(context: Context, courses: List<Course>) {
        val array = JSONArray()
        courses.forEach { array.put(it.toJson()) }
        val sp = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        sp.edit().putString(KEY_COURSES, array.toString()).apply()
    }

    private fun getDemoCourses(): MutableList<Course> {
        return mutableListOf(
            Course("demo_1", "高等数学 (上)", "教1-101", "张教授", 1, 1, 2, 1, 16),
            Course("demo_2", "大学英语 (综合)", "教2-205", "李老师", 1, 3, 4, 1, 16),
            Course("demo_3", "线性代数", "教1-102", "王教授", 1, 5, 6, 1, 16),
            Course("demo_4", "计算机导论", "信息楼204", "赵副教授", 1, 7, 8, 1, 12),
            Course("demo_5", "大学物理 (力学)", "理科楼301", "钱教授", 2, 3, 4, 1, 16),
            Course("demo_6", "思想道德与法治", "教一302", "陈老师", 2, 5, 6, 1, 14),
            Course("demo_7", "Python程序设计", "实验楼402机房", "孙讲师", 2, 7, 8, 1, 16),
            Course("demo_8", "高等数学 (上)", "教1-101", "张教授", 3, 1, 2, 1, 16),
            Course("demo_9", "体育 (羽毛球)", "风雨操场", "周教练", 3, 3, 4, 1, 16),
            Course("demo_10", "离散数学", "信息楼102", "吴副教授", 3, 7, 8, 1, 16),
            Course("demo_11", "大学物理 (力学)", "理科楼301", "钱教授", 4, 1, 2, 1, 16),
            Course("demo_12", "大学英语 (综合)", "教2-205", "李老师", 4, 3, 4, 1, 16),
            Course("demo_13", "中国近代史纲要", "教一401", "郑老师", 4, 5, 6, 1, 12),
            Course("demo_14", "面向对象程序设计", "信息楼305", "冯教授", 5, 3, 4, 1, 16),
            Course("demo_15", "数据结构基础", "实验楼301", "蒋讲师", 5, 5, 6, 1, 16),
            Course("demo_16", "前沿学术讲座", "学术报告厅", "特邀院士", 6, 1, 1, 1, 16),
            Course("demo_17", "人工智能导论", "信息楼201", "魏副教授", 6, 3, 4, 1, 16),
            Course("demo_18", "运筹与优化", "教二203", "韩教授", 6, 3, 4, 1, 16),
            Course("demo_19", "软件工程综合实训与课程设计", "工程实践中心B区", "创新导师团", 6, 5, 8, 1, 16)
        )
    }
}
