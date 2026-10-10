package com.minimal.timetable

import org.json.JSONObject

/**
 * 极简课程数据模型 (无多余冗余字段，极致轻量)
 */
data class Course(
    val id: String,
    val name: String,
    val room: String = "",
    val teacher: String = "",
    val day: Int,          // 1 ~ 7 (周一至周日)
    val startPeriod: Int,  // 1 ~ 12
    val endPeriod: Int,    // 1 ~ 12
    val startWeek: Int = 1,
    val endWeek: Int = 16,
    val weekType: String = "all" // "all", "odd", "even"
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("name", name)
            put("room", room)
            put("teacher", teacher)
            put("day", day)
            put("startPeriod", startPeriod)
            put("endPeriod", endPeriod)
            put("startWeek", startWeek)
            put("endWeek", endWeek)
            put("weekType", weekType)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): Course {
            return Course(
                id = json.optString("id", System.currentTimeMillis().toString()),
                name = json.optString("name", "未命名课程"),
                room = json.optString("room", ""),
                teacher = json.optString("teacher", ""),
                day = json.optInt("day", 1),
                startPeriod = json.optInt("startPeriod", 1),
                endPeriod = json.optInt("endPeriod", 2),
                startWeek = json.optInt("startWeek", 1),
                endWeek = json.optInt("endWeek", 16),
                weekType = json.optString("weekType", "all")
            )
        }
    }
}
