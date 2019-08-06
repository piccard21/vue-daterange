<template>
    <div
            class="mj-daterange-picker"
            :style="cssProps"
    >
        <!--PANELS-->
        <div
                v-if="availablePanels.length > 1"
                class="panels-choices"
        >
            <div class="float-left">
                <div
                        v-for="(panel, i) in availablePanels"
                        :key="i"
                        class="panel-button m-1"
                        :class="{ 'is-current': panel === currentPanel }"
                        @click="setPanel(panel)"
                >
                    {{ $legends[locale].panels[panel] }}
                </div>
            </div>
        </div>

        <!--PRESETS-->
        <div
                v-if="isPresetPicker"
                class="preset-ranges"
        >
            <div class="row">
                <div
                        v-for="(entry, i) in availablePresets"
                        :key="i"
                        class="preset col-12 col-md-6"
                >
                    <input
                            :id="entry"
                            :ref="'preset' + entry"
                            v-model="preset"
                            type="radio"
                            :value="entry"
                    >
                    <label :for="entry">
                        <span class="check"/>
                        <span>{{ $legends[locale].presets[entry] }}</span>
                    </label>
                </div>
            </div>
        </div>

        <!--DAYS-PICKER-->
        <div
                v-if="isDaysPicker"
                class="mj-calendar"
                :class="weekSelector ? 'mj-calendar-week' : 'mj-calendar-days'"
        >
            <div class="calendar-header">
                <div
                        class="calendar-previous-month calendar-arrow calendar-arrow-previous"
                        :aria-label="$legends[locale].previousMonth"
                        @click="changeMonth(1)"
                >
                    <svgicon
                            icon="arrow-left"
                            width="7.4"
                            height="12"
                    />
                </div>
                <div class="calendar-month-name">{{ currentMonthName }}</div>
                <div
                        class="calendar-previous-month calendar-arrow calendar-arrow-next"
                        :aria-label="$legends[locale].nextMonth"
                        @click="changeMonth(-1)"
                >
                    <svgicon
                            icon="arrow-right"
                            width="7.4"
                            height="12"
                    />
                </div>
            </div>

            <!--CALENDAR-->
            <div class="calendar-days-name">
                <div
                        v-for="(day, i) in firstWeek"
                        :key="i"
                        class="day"
                >
                    <span>{{ day.name }}</span>
                </div>
            </div>
            <div class="calendar-days">
                <div
                        v-for="day in monthDays"
                        :key="day.date | date('DDMMYYYY')"
                        class="day"
                        :class="dayClasses(day)"
                        @click="selectDay(day.date)"
                        @mouseover="hoverizeDay(day.date)"
                        @mouseleave="hoverRange = []"
                >
                    <span>{{ day.date | date('D') }}</span>
                </div>
            </div>
        </div>


        <!--MONTHS-PICKER-->
        <div
                v-if="isMonthsPicker"
                class="mj-calendar"
        >
            <div class="calendar-header">
                <div
                        class="calendar-previous-month calendar-arrow calendar-arrow-previous"
                        :aria-label="$legends[locale].previousYear"
                        @click="changeYear(1)"
                >
                    <svgicon
                            icon="arrow-left"
                            width="7.4"
                            height="12"
                    />
                </div>
                <div class="calendar-month-name">{{ currentYearName }}</div>
                <div
                        class="calendar-previous-month calendar-arrow calendar-arrow-next"
                        :aria-label="$legends[locale].nextYear"
                        @click="changeYear(-1)"
                >
                    <svgicon
                            icon="arrow-right"
                            width="7.4"
                            height="12"
                    />
                </div>
            </div>

            <div
                    v-if="isMonthsPanel"
                    class="calendar-months"
            >
                <div class="row d-flex justify-content-center">
                    <div
                            v-for="month in yearMonths"
                            :key="month.date | date('DDMMYYYY')"
                            class="month col-12 col-md-4 m-1"
                            :class="monthClasses(month)"
                            @click="selectMonth(month)"
                    >
                        <span>{{ month.displayDate }}</span>
                    </div>
                </div>
            </div>

            <!--QUARTERS-PICKER-->
            <div
                    v-if="isQuartersPanel"
                    class="calendar-quarters"
            >
                <div
                        v-for="(quarter, index) in yearQuarters"
                        :key="index"
                        class="row d-flex align-items-center quarter"
                        :class="quarterClasses(quarter)"
                        @click="selectQuarter(quarter)"
                >
                    <div
                            class="col-12 col-md-2 align-items-center justify-content-center legend p-1"
                    >
                        {{ $legends[locale].quarter }} {{ ++index }}
                    </div>
                    <div
                            class="col-12 col-md-10 align-items-center justify-content-center legend"
                    >
                        <div class="months row">
                            <div
                                    v-for="(month, i) in quarter.months"
                                    :key="i"
                                    class="month col-12 col-md-4"
                            >
                                <span>{{ month.displayDate }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--YEARS-PICKER-->
        <div
                v-if="isYearPicker"
                class="mj-calendar"
        >
            <div class="calendar-years">
                <div
                        v-for="(year, i) in years"
                        :key="i"
                        class="year"
                        :class="yearClasses(year)"
                        @click="selectYear(year)"
                >
                    <span>{{ year.displayDate }}</span>
                </div>
            </div>
        </div>
        <div class="mj-daterange-picker-controls">
            <div class="d-flex flex-wrap justify-content-center">
                <span
                        class="mj-daterange-picker-button mr-md-2 mt-1 mj-daterange-picker-reset"
                        @click="reset"
                >{{ resetLegend }}</span>
                <span
                        class="mj-daterange-picker-button mt-1 mj-daterange-picker-submit"
                        :class="{'is-disabled': !(values.from && values.to) }"
                        @click="update"
                >{{ submitLegend }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import './../assets/icons'
    import 'bootstrap-4-grid/css/grid.min.css'
    import {dateFilter} from 'vue-date-fns'
    import {
        addDays,
        addMonths,
        addWeeks,
        addYears,
        endOfDay,
        endOfMonth,
        endOfWeek,
        endOfYear,
        format,
        isAfter,
        isBefore,
        isSameDay,
        isSameMonth,
        isValid,
        isWithinRange,
        parse,
        startOfDay,
        startOfMonth,
        startOfWeek,
        startOfYear,
        subDays,
        subMonths,
        subWeeks,
        subYears
    } from 'date-fns'

    const locales = {
        en: require('date-fns/locale/en'),
        fr: require('date-fns/locale/fr'),
        de: require('date-fns/locale/de')
    }

    export default {
        filters: {
            date: dateFilter
        },
        props: {
            begin: {
                type: String,
                default: null
            },
            from: {
                type: String,
                default: null
            },
            future: {
                type: Boolean,
                default: true
            },
            locale: {
                type: String,
                default: 'en'
            },
            past: {
                type: Boolean,
                default: true
            },
            panel: {
                type: String,
                default: 'range'
            },
            presets: {
                type: Array,
                default: () => [
                    'today',
                    'yesterday',
                    'last7days',
                    'last30days',
                    'last90days',
                    'last365days',
                    'forever',
                    'custom'
                ]
            },
            panels: {
                type: Array,
                default: () => ['range', 'week', 'month', 'quarter', 'year']
            },
            resetTitle: {
                type: String,
                default: null
            },
            submitTitle: {
                type: String,
                default: "ok"
            },
            theme: {
                type: Object,
                default: () => {
                    return {
                        primary: '#3297DB',
                        secondary: '#2D3E50',
                        ternary: '#93A0BD',
                        border: '#e6e6e6',
                        light: '#ffffff',
                        dark: '#000000',
                        hovers: {
                            day: '#CCC',
                            range: '#e6e6e6'
                        }
                    }
                }
            },
            to: {
                type: String,
                default: null
            },
            width: {
                type: String,
                default: 'auto'
            },
            yearsCount: {
                type: Number,
                default: 2
            }
        },
        data() {
            return {
                // $legends: any;
                currentPanel: undefined,
                current: null,
                weekSelector: false,
                monthDays: [],
                now: new Date().toISOString(),
                values: {
                    from: null,
                    to: null
                },
                hoverRange: [],
                preset: 'custom'
            }
        },
        computed: {
            availablePanels() {
                return this.panels
            },
            availablePresets() {
                const index = this.presets.indexOf('forever')
                if (!this.begin && index > -1) {
                    this.splicePresets(index)
                }
                return this.presets
            },
            cssProps() {
                return {
                    '--default-width': this.width,
                    '--primary-color': this.theme.primary,
                    '--hover-day-color': this.theme.hovers.day,
                    '--hover-range-color': this.theme.hovers.range,
                    '--secondary-color': this.theme.secondary,
                    '--ternary-color': this.theme.ternary,
                    '--normal-color': this.theme.light,
                    '--contrast-color': this.theme.dark,
                    '--border-color': this.theme.border
                }
            },
            currentMonthName() {
                return format(this.current, 'MMMM YYYY', {
                    locale: locales[this.locale]
                })
            },
            currentYearName() {
                return format(this.current, 'YYYY', {locale: locales[this.locale]})
            },
            isPresetPicker() {
                return this.currentPanel === 'range'
            },
            isDaysPicker() {
                return this.currentPanel === 'range' || this.currentPanel === 'week'
            },
            isMonthsPicker() {
                return this.currentPanel === 'month' || this.currentPanel === 'quarter'
            },
            isYearPicker() {
                return this.currentPanel === 'year'
            },
            isMonthsPanel() {
                return this.currentPanel === 'month'
            },
            isQuartersPanel() {
                return this.currentPanel === 'quarter'
            },
            firstWeek() {
                const days = this.monthDays.slice(0, 7)
                const week = []
                for (const day of days) {
                    week.push({
                        name: format(day.date, 'dd', {locale: locales[this.locale]})
                    })
                }
                return week
            },
            resetLegend() {
                return this.resetTitle ?
                    this.resetTitle :
                    this.$legends[this.locale].reset
            },
            submitLegend() {
                return this.submitTitle ?
                    this.submitTitle :
                    this.$legends[this.locale].submit
            },
            yearMonths() {
                const months = []
                let month = startOfYear(this.current)
                while (months.length !== 12) {
                    months.push({
                        date: month,
                        displayDate: format(month, 'MMMM', {locale: locales[this.locale]})
                    })
                    month = addMonths(month, 1)
                }
                return months
            },
            yearQuarters() {
                const quarters = []

                Object.keys(this.yearMonths).forEach((v, index) => {
                    if (index % 3 === 0) {
                        quarters.push({
                            months: [
                                this.yearMonths[index],
                                this.yearMonths[index + 1],
                                this.yearMonths[index + 2]
                            ],
                            range: {
                                start: startOfDay(startOfMonth(this.yearMonths[index].date)),
                                end: endOfDay(endOfMonth(this.yearMonths[index + 2].date))
                            }
                        })
                    }
                })

                return quarters
            },
            years() {
                const years = []
                let i = this.yearsCount
                let start = this.future ? addYears(this.now, this.yearsCount) : this.now

                i = +this.future * this.yearsCount + +this.past * this.yearsCount + 1

                while (i !== 0) {
                    years.push({
                        date: start,
                        displayDate: format(start, 'YYYY', {locale: locales[this.locale]})
                    })
                    start = subYears(start, 1)
                    i = i - 1
                }

                return years
            }
        },
        created() {
            // Parse Inputs
            Object.keys(this.values).forEach(value => {
                this.values[value] = isValid(parse(this[value])) ? this[value] : null
            })

            // Todo ? If from or to is null, or from is after to, both are null

            // Display current month or "to" month
            this.current = this.values.to ? this.values.to : this.now

            // Update Calendar
            this.updateCalendar()

            // Set current panel
            this.currentPanel = this.panel || this.availablePanels[0]
        },
        watch: {
            currentPanel: {
                immediate: true,
                handler(v) {
                    this.weekSelector = v === 'week'
                    this.updateCalendar()
                }
            },
            preset(preset) {
                this.current = this.now
                this.updateCalendar()

                switch (preset) {
                    case 'custom':
                        this.values = {from: null, to: null}
                        break
                    case 'today':
                        this.values = {from: startOfDay(this.now), to: this.now}
                        break
                    case 'yesterday':
                        this.values = {
                            from: startOfDay(subDays(this.now, 1)),
                            to: endOfDay(subDays(this.now, 1))
                        }
                        break
                    case 'tomorrow':
                        this.values = {
                            from: startOfDay(addDays(this.now, 1)),
                            to: endOfDay(addDays(this.now, 1))
                        }
                        break
                    case 'last7days':
                        this.values = {
                            from: startOfDay(subWeeks(this.now, 1)),
                            to: this.now
                        }
                        break
                    case 'next7days':
                        this.values = {
                            to: startOfDay(addWeeks(this.now, 1)),
                            from: this.now
                        }
                        break
                    case 'last30days':
                        this.values = {
                            from: startOfDay(subMonths(this.now, 1)),
                            to: this.now
                        }
                        break
                    case 'next30days':
                        this.values = {
                            to: startOfDay(addMonths(this.now, 1)),
                            from: this.now
                        }
                        break
                    case 'last90days':
                        this.values = {
                            from: startOfDay(subMonths(this.now, 3)),
                            to: this.now
                        }
                        break
                    case 'next90days':
                        this.values = {
                            to: startOfDay(addMonths(this.now, 3)),
                            from: this.now
                        }
                        break
                    case 'last365days':
                        this.values = {
                            from: startOfDay(subYears(this.now, 1)),
                            to: this.now
                        }
                        break
                    case 'next365days':
                        this.values = {
                            to: startOfDay(addYears(this.now, 1)),
                            from: this.now
                        }
                        break
                    case 'forever':
                        this.values = {from: this.begin, to: this.now}
                        break
                }
            }
        },
        methods: {
            changeMonth(diff) {
                this.current = subMonths(this.current, diff)
                this.updateCalendar()
            },

            changeYear(diff) {
                this.current = subYears(this.current, diff)
                this.updateCalendar()
            },
            dayClasses(day) {
                const classes = []

                if (day.currentMonth) {
                    classes.push('is-current-month')
                }
                if (
                    this.values.from &&
                    this.values.to &&
                    isWithinRange(day.date, this.values.from, this.values.to)
                ) {
                    classes.push('is-selected')
                }
                if (!day.selectable) {
                    classes.push('is-disabled')
                }
                if (isSameDay(day.date, this.now)) {
                    classes.push('is-today')
                }
                if (
                    (!this.values.to && isSameDay(day.date, this.values.from)) ||
                    (this.values.to &&
                        !this.values.from &&
                        isSameDay(day.date, this.values.from) &&
                        isSameDay(day.date, this.values.to)) ||
                    (this.values.to &&
                        this.values.from &&
                        isSameDay(day.date, this.values.from))
                ) {
                    classes.push('is-first-range')
                    classes.push('is-edge-range')
                }
                if (this.values.to && isSameDay(day.date, this.values.to)) {
                    classes.push('is-last-range')
                    classes.push('is-edge-range')
                }

                if (
                    this.hoverRange.length === 2 &&
                    isWithinRange(day.date, this.hoverRange[0], this.hoverRange[1])
                ) {
                    classes.push('is-in-range')
                }
                return classes
            },
            hoverizeDay(date) {
                if (
                    !this.weekSelector &&
                    (!(this.values.from && !this.values.to) ||
                        isBefore(date, this.values.from))
                ) {
                    this.hoverRange = []
                    return
                }
                if (this.weekSelector) {
                    this.hoverRange = [
                        startOfWeek(date, {weekStartsOn: 1}),
                        endOfWeek(date, {weekStartsOn: 1})
                    ]
                } else {
                    this.hoverRange = [this.values.from, date]
                }
            },
            monthClasses(month) {
                const classes = []
                if (
                    this.values.to &&
                    this.values.from &&
                    isWithinRange(month.date, this.values.from, this.values.to)
                ) {
                    classes.push('is-selected')
                }
                return classes
            },
            quarterClasses(quarter) {
                const classes = []
                if (
                    this.values.to &&
                    this.values.from &&
                    isWithinRange(quarter.range.start, this.values.from, this.values.to) &&
                    isWithinRange(quarter.range.end, this.values.from, this.values.to)
                ) {
                    classes.push('is-selected')
                }
                return classes
            },
            reset() {
                this.values = {
                    to: null,
                    from: null
                }

                if (this.preset !== 'custom') {
                    this.preset = null
                }

                this.$emit('reset', {to: null, from: null})
            },
            selectDay(date) {
                if (this.weekSelector) {
                    this.values.from = startOfWeek(date, {weekStartsOn: 1})
                    this.values.to = endOfWeek(date, {weekStartsOn: 1})
                    return
                }
                if (
                    (this.values.from && this.values.to) ||
                    (!this.values.from && !this.values.to)
                ) {
                    this.values.from = date
                    this.values.to = null
                } else if (this.values.from && !this.values.to) {
                    if (isBefore(date, this.values.from)) {
                        this.values.from = date
                    } else {
                        this.values.to = date
                        this.hoverRange = []
                    }
                }
                this.preset = 'custom'
            },
            selectQuarter(quarter) {
                this.values.from = startOfDay(startOfMonth(quarter.range.start))
                this.values.to = endOfMonth(quarter.range.end)
                this.current = this.values.to
            },

            selectMonth(month) {
                this.values.from = startOfMonth(month.date)
                this.values.to = endOfMonth(month.date)
                this.current = this.values.to
            },

            selectYear(year) {
                this.values.from = startOfYear(year.date)
                this.values.to = endOfYear(year.date)
                this.current = this.values.to
            },
            setPanel(panel) {
                this.currentPanel = panel;
                this.reset()
            },
            splicePresets(index) {
                this.presets.splice(index, 1)
            },

            update() {
                if (!this.values.from || !this.values.to) {
                    return
                }
                this.$emit('update', {
                    to: format(endOfDay(this.values.to), 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                    from: format(startOfDay(this.values.from), 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                    panel: this.currentPanel
                })
            },
            updateCalendar() {
                const days = []

                const lastDayOfMonth = endOfMonth(this.current)
                const firstDayOfMonth = startOfMonth(this.current)
                const nbDaysLastMonth = (+format(firstDayOfMonth, 'd') - 1) % 7

                let day = subDays(firstDayOfMonth, nbDaysLastMonth)

                while (isBefore(day, lastDayOfMonth) || days.length % 7 > 0) {
                    days.push({
                        date: day,
                        selectable:
                            this.future && isAfter(day, this.now) ?
                                true :
                                false || (this.past && isBefore(day, this.now)) ?
                                    true :
                                    false || isSameDay(day, this.now),
                        currentMonth: isSameMonth(this.current, day)
                    })
                    day = addDays(day, 1)
                }
                this.monthDays = days
            },

            yearClasses(year) {
                const classes = []
                if (this.values.to && this.values.from) {
                    if (
                        isSameDay(this.values.from, startOfYear(year.date)) &&
                        isSameDay(this.values.to, endOfYear(year.date))
                    ) {
                        classes.push('is-selected')
                    }
                }
                return classes
            }
        }
    }
</script>

<style lang="scss">
    .mj-daterange-picker {
        text-align: left;
        min-width: 200px;
        width: var(--default-width);
        user-select: none;
        border: 1px solid var(--border-color);
        border-radius: 4px;

        & * {
            box-sizing: border-box;
        }
    }

    .mj-daterange-picker .panels-choices {
        border-bottom: 1px solid var(--border-color);
        padding: 20px;

        .panel-button {
            font-size: 12px;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            padding: 5px 15px;
            border-radius: 4px;
            cursor: pointer;
            background-color: #f2f4f5;

            &.is-current,
            &:hover {
                background-color: var(--primary-color);
                color: white;
            }
        }
    }

    .mj-daterange-picker .preset-ranges {
        padding: 20px;
        border-bottom: 1px solid var(--border-color);

        .preset {
            font-size: 13px;
            height: 20px;
            cursor: pointer;
            margin: 5px 0;

            input {
                position: absolute;
                opacity: 0;
                height: 0;
                width: 0;

                &:checked ~ label .check {
                    background-color: var(--primary-color);

                    &::after {
                        background-color: transparent;
                    }
                }
            }

            label {
                display: inline-flex;
                align-items: center;

                span + span {
                    margin-left: 10px;
                }

                .check {
                    display: block;
                    position: relative;
                    height: 20px;
                    width: 20px;
                    background-color: var(--secondary-color);
                    border-radius: 10px;

                    &::after {
                        content: "";
                        position: absolute;
                        height: 10px;
                        width: 10px;
                        left: 50%;
                        top: 50%;
                        background-color: white;
                        border-radius: 100%;
                        border: 3px solid white;
                        transform: translateX(-50%) translateY(-50%);
                    }
                }
            }

            * {
                cursor: pointer;
            }
        }
    }

    .mj-calendar {
        color: var(--contrast-color);
        background-color: var(--normal-color);
        padding: 20px;

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .calendar-month-name {
                flex: 1;
                text-align: center;
                color: var(--secondary-color);
                font-weight: bold;
                font-size: 14px;
            }

            .calendar-arrow {
                fill: var(--secondary-color);
                cursor: pointer;
            }
        }

        .calendar-months {
            margin-top: 20px;

            .month {
                height: 50px;
                padding: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                font-size: 13px;

                &:hover {
                    background-color: var(--hover-range-color);
                }

                &.is-selected {
                    background-color: var(--primary-color);
                    color: white;
                }

                &:not(.is-disabled) {
                    cursor: pointer;
                }
            }
        }

        .calendar-quarters {
            margin-top: 20px;

            .quarter {
                margin: 10px 0;
                align-items: center;
                font-size: 13px;

                .months {
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 10px 30px;

                    &:hover {
                        background-color: var(--hover-range-color);
                    }

                    .month {
                        text-align: center;
                    }
                }

                &.is-selected .months {
                    background-color: var(--primary-color);
                    color: white;
                }

                &:not(.is-disabled) .months {
                    cursor: pointer;
                }
            }
        }

        .calendar-years {
            .year {
                height: 50px;
                padding: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                font-size: 13px;
                margin: 10px 0;

                &:hover {
                    background-color: var(--hover-range-color);
                }

                &.is-selected {
                    background-color: var(--primary-color);
                    color: white;
                }

                &:not(.is-disabled) {
                    cursor: pointer;
                }
            }
        }

        .calendar-days-name,
        .calendar-days {
            display: flex;
            flex-wrap: wrap;

            .day {
                width: calc(100% / 7);
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
        }

        .calendar-days-name .day {
            font-size: 11px;
            color: var(--ternary-color);
            height: 30px;
        }

        .calendar-days .day {
            height: 40px;
            font-size: 13px;
            border-top: 2px solid white;
            border-bottom: 2px solid white;

            &:not(.is-current-month) {
                color: var(--ternary-color);
            }

            &.is-disabled {
                cursor: not-allowed;
                opacity: 0.5;
                pointer-events: none;
            }

            &.is-today {
                span {
                    color: var(--secondary-color);
                    font-weight: bold;
                }
            }

            &.is-in-range {
                background-color: var(--hover-range-color);
            }

            &.is-first-range {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
            }

            &.is-last-range {
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
            }

            &.is-edge-range {
                background-color: var(--primary-color);
                color: white;
            }

            &.is-selected {
                background-color: var(--primary-color);
                color: white;
            }

            &:not(.is-disabled) {
                cursor: pointer;
            }
        }
    }

    .mj-calendar.mj-calendar-days {
        .calendar-days .day {
            &:not(.is-edge-range):hover {
                background-color: var(--hover-day-color);
            }
        }
    }

    .mj-daterange-picker-controls {
        margin-top: 10px;
        border-top: 1px solid var(--border-color);
        padding: 20px;

        .mj-daterange-picker-button {
            height: 36px;
            min-width: 150px;
            padding: 5px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            font-size: 12px;

            &:not(.is-disabled) {
                cursor: pointer;
            }
        }
    }

    .mj-daterange-picker-reset {
        border: 1px solid #e6eaed;
    }

    .mj-daterange-picker-submit {
        background-color: var(--primary-color);
        color: white;

        &.is-disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
    }
</style>
