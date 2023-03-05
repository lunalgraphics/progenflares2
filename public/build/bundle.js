
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/Collapsible.svelte generated by Svelte v3.55.1 */
    const file$3 = "src/Collapsible.svelte";

    // (29:0) {#if (!collapsed)}
    function create_if_block$1(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "id", "contents");
    			attr_dev(div, "class", "svelte-14a9ty7");
    			add_location(div, file$3, 29, 4, 599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, slide, {});
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, slide, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(29:0) {#if (!collapsed)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t0_value = (/*collapsed*/ ctx[0] ? "+" : "-") + "";
    	let t0;
    	let t1;
    	let b;
    	let t2;
    	let t3;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*collapsed*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			b = element("b");
    			t2 = text(/*title*/ ctx[1]);
    			t3 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "style", "width: 18px; text-align: center; display: inline-block;");
    			add_location(div0, file$3, 22, 4, 438);
    			add_location(b, file$3, 25, 4, 553);
    			attr_dev(div1, "id", "nameTag");
    			attr_dev(div1, "class", "svelte-14a9ty7");
    			add_location(div1, file$3, 21, 0, 383);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, b);
    			append_dev(b, t2);
    			insert_dev(target, t3, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "mousedown", /*toggleCollapse*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*collapsed*/ 1) && t0_value !== (t0_value = (/*collapsed*/ ctx[0] ? "+" : "-") + "")) set_data_dev(t0, t0_value);
    			if (!current || dirty & /*title*/ 2) set_data_dev(t2, /*title*/ ctx[1]);

    			if (!/*collapsed*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let current$2;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Collapsible', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { title } = $$props;
    	let { collapsed = true } = $$props;
    	let nameTag;
    	let contents;

    	function toggleCollapse() {
    		$$invalidate(0, collapsed = !collapsed);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (title === undefined && !('title' in $$props || $$self.$$.bound[$$self.$$.props['title']])) {
    			console.warn("<Collapsible> was created without expected prop 'title'");
    		}
    	});

    	const writable_props = ['title', 'collapsed'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Collapsible> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		current: current$2,
    		createEventDispatcher,
    		slide,
    		dispatch,
    		title,
    		collapsed,
    		nameTag,
    		contents,
    		toggleCollapse
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('nameTag' in $$props) nameTag = $$props.nameTag;
    		if ('contents' in $$props) contents = $$props.contents;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [collapsed, title, toggleCollapse, $$scope, slots];
    }

    class Collapsible extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 1, collapsed: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapsible",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get title() {
    		throw new Error("<Collapsible>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Collapsible>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get collapsed() {
    		throw new Error("<Collapsible>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<Collapsible>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /*
    colorvibrance.js - a JS library for colorizing black-background overlays

    Written by yikuansun (https://github.com/yikuansun)
    */
    function colorvibrance(ctx, hue=200, saturation=100) {
        ctx.save();

        // get color map
        ctx.fillStyle = `hsl(${hue}deg, ${saturation}%, ${50 - saturation / 4}%)`;
        ctx.globalCompositeOperation = "soft-light";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.restore();
    }

    var colorvibrance_1 = colorvibrance;

    class EllipticalGradient {
        canvas = document.createElement("canvas");

        getLuma(distance, maxDistance) {
            return 1 - Math.sqrt(1 - Math.pow(distance / maxDistance - 1, 2));
        }

        constructor() {
            var canv = this.canvas;
            canv.width = 2048;
            canv.height = 2048;
            var ctx = canv.getContext("2d");
            ctx.restore();
            ctx.save();

            ctx.fillRect(0, 0, canv.width, canv.height);

            var iData = ctx.getImageData(0, 0, canv.width, canv.height);
            var data = iData.data;
            for (var i = 0; i < data.length; i += 4) {
                var distFromTop = Math.floor(i / 4 / canv.width);
                var pixelBrightness = this.getLuma(distFromTop, canv.height);
                data[i] = 255 * pixelBrightness;
                data[i + 1] = 255 * pixelBrightness;
                data[i + 2] = 255 * pixelBrightness;
            }
            ctx.putImageData(iData, 0, 0);
        }
    }

    class PrerenderedEllipticalGradient {
        static canvas = (new EllipticalGradient()).canvas;
    }

    var EllipticalGradient_1 = PrerenderedEllipticalGradient;

    class FractalNoise {
        canvas = document.createElement("canvas");
        svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        options = {
            baseFrequency: [0.01, 0.01],
            type: "fractalNoise",
            numOctaves: 10,
            seed: 1,
            stitchTiles: "stitch"
        };
        width = 1920;
        height = 1080;

        setOptions(options) {
            for (var opt in options) {
                this.options[opt] = options[opt];
            }
            this.svgFilter.innerHTML = `<feTurbulence
            baseFrequency="${this.options.baseFrequency.join(" ")}"
            type="${this.options.type}"
            numOctaves="${this.options.numOctaves}"
            seed="${this.options.seed}"
            stitchTiles="${this.options.stitchTiles}"
            color-interpolation-filters="linearRGB"
        />`;
        }

        constructor(width, height, options) {
            this.svgFilter.id = `fNoiseFilter${Math.random().toFixed(8).replace("0.", "")}`;
            this.svgFilter.setAttribute("x", "0%");
            this.svgFilter.setAttribute("y", "0%");
            this.svgFilter.setAttribute("width", "100%");
            this.svgFilter.setAttribute("height", "100%");
            this.setOptions(options);
            this.width = width;
            this.height = height;
        }

        render() {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            var canv = this.canvas;

            var ctx = canv.getContext("2d");
            ctx.restore();
            ctx.save();
            ctx.clearRect(0, 0, canv.width, canv.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canv.width, canv.height);
            ctx.restore();
            ctx.save();

            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.appendChild(this.svgFilter);
            document.body.appendChild(svg);
            ctx.filter = `url(#${this.svgFilter.id})`;
            ctx.fillRect(0, 0, canv.width, canv.height);
            svg.remove();
        }
    }

    var FractalNoise_1 = FractalNoise;

    function polarCoordinatesFilter(ctx) {
        var canvas = ctx.canvas;
        var inputImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var outputImageData = new ImageData(canvas.width, canvas.height);
        var inputData = inputImageData.data;
        var outputData = outputImageData.data;
        var origin = { x: canvas.width / 2, y: canvas.height / 2 };
        var outputX = -1, outputY = 0;
        var inputX = -1, inputY = 0;
        for (var i = 0; i < outputData.length; i += 4) {
            outputX++;
            if (outputX >= canvas.width) {
                outputY++;
                outputX = 0;
            }
            var angle = Math.atan2(outputY - origin.y, outputX - origin.x);
            var radius = Math.sqrt(Math.pow(outputX - origin.x, 2) + Math.pow(outputY - origin.y, 2));
            if (radius > canvas.width / 2) {
                continue;
            }
            inputX = Math.round(angle / Math.PI / 2 * canvas.width);
            inputY = Math.round(radius * 2);
            var inputI = 4 * (inputY * canvas.width + inputX);
            outputData[i] = inputData[inputI];
            outputData[i + 1] = inputData[inputI + 1];
            outputData[i + 2] = inputData[inputI + 2];
            outputData[i + 3] = 255;
        }
        ctx.putImageData(outputImageData, 0, 0);
    }

    var polarCoordinatesFilter_1 = polarCoordinatesFilter;

    class SpotComponent {
        canvas = document.createElement("canvas");
        options = {
            intensity: 10,
            deformationFrequency: 0.006,
            deformationAmount: 1.6,
            deformationSeed: 1,
            hue: 200,
            saturation: 100,
        };
        radius = 1024;

        constructor(radius, options) {
            this.radius = radius;
            for (var opt in options) {
                this.options[opt] = options[opt];
            }
        }

        render() {
            this.canvas.width = this.radius * 2;
            this.canvas.height = this.radius * 2;
            var ctx = this.canvas.getContext("2d");
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(EllipticalGradient_1.canvas, 0, this.options.intensity, this.canvas.width, this.canvas.height - this.options.intensity);

            var deformationTexture = new FractalNoise_1(1024, 1024, {
                baseFrequency: [this.options.deformationFrequency, 0],
                seed: this.options.deformationSeed,
            });
            deformationTexture.render();

            ctx.restore();
            ctx.save();
            ctx.globalCompositeOperation = "soft-light";
            ctx.filter = `saturate(0) contrast(${this.options.deformationAmount})`;
            ctx.drawImage(deformationTexture.canvas, 0, 0, this.canvas.width, this.canvas.height);

            ctx.restore();
            ctx.save();
            colorvibrance_1(ctx, this.options.hue, this.options.saturation);

            polarCoordinatesFilter_1(ctx);
        }
    }

    class RingComponent {
        canvas = document.createElement("canvas");
        radius = 512;
        options = {
            thickness: 10,
            blur: 3,
            cropSize: 200,
            cropHardness: 50,
            hue: 200,
            saturation: 100,
        };

        setOptions(options) {
            for (var opt in options) {
                this.options[opt] = options[opt];
            }
        }

        constructor(radius, options) {
            this.radius = radius;
            this.setOptions(options);
        }

        render() {
            this.canvas.width = this.radius * 2;
            this.canvas.height = this.radius * 2;
            
            var ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.beginPath();
            ctx.arc(this.radius, this.radius, this.radius - this.options.blur * 2, 0, 2 * Math.PI, true);
            var gradient = ctx.createRadialGradient(this.radius, this.radius, 0, this.radius, this.radius, this.radius - this.options.blur * 2);
            gradient.addColorStop(0, "black");
            gradient.addColorStop(Math.max(1 - (this.options.thickness / this.radius), 0), "black");
            gradient.addColorStop(1, "white");
            ctx.fillStyle = gradient;
            ctx.filter = `blur(${this.options.blur}px)`;
            ctx.fill();
            var cropGradient = ctx.createLinearGradient(0, 0, 0, this.options.cropSize);
            cropGradient.addColorStop(0, "black");
            cropGradient.addColorStop(this.options.cropHardness / 100, "black");
            cropGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = cropGradient;
            ctx.fillRect(0, 0, this.canvas.width, this.options.cropSize);
            cropGradient = ctx.createLinearGradient(0, this.canvas.height - this.options.cropSize, 0, this.canvas.height);
            cropGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
            cropGradient.addColorStop(1 - this.options.cropHardness / 100, "black");
            cropGradient.addColorStop(1, "black");
            ctx.fillStyle = cropGradient;
            ctx.fillRect(0, this.canvas.height - this.options.cropSize, this.canvas.width, this.options.cropSize);

            colorvibrance_1(ctx, this.options.hue, this.options.saturation);
            ctx.restore();
            ctx.save();
        }
    }

    /* src/Slider.svelte generated by Svelte v3.55.1 */
    const file$2 = "src/Slider.svelte";

    function create_fragment$2(ctx) {
    	let slider;
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			slider = element("slider");
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", /*min*/ ctx[1]);
    			attr_dev(input0, "max", /*max*/ ctx[2]);
    			attr_dev(input0, "step", /*step*/ ctx[3]);
    			attr_dev(input0, "class", "svelte-n1z3wa");
    			add_location(input0, file$2, 28, 0, 487);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", /*step*/ ctx[3]);
    			attr_dev(input1, "class", "svelte-n1z3wa");
    			add_location(input1, file$2, 29, 0, 631);
    			add_location(slider, file$2, 27, 0, 478);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, slider, anchor);
    			append_dev(slider, input0);
    			set_input_value(input0, /*value*/ ctx[0]);
    			/*input0_binding*/ ctx[9](input0);
    			append_dev(slider, t);
    			append_dev(slider, input1);
    			set_input_value(input1, /*value*/ ctx[0]);
    			/*input1_binding*/ ctx[11](input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[8]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[8]),
    					listen_dev(input0, "input", /*updateValues*/ ctx[6], false, false, false),
    					listen_dev(input0, "change", /*onChange*/ ctx[7], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen_dev(input1, "input", /*updateValues*/ ctx[6], false, false, false),
    					listen_dev(input1, "change", /*onChange*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*min*/ 2) {
    				attr_dev(input0, "min", /*min*/ ctx[1]);
    			}

    			if (dirty & /*max*/ 4) {
    				attr_dev(input0, "max", /*max*/ ctx[2]);
    			}

    			if (dirty & /*step*/ 8) {
    				attr_dev(input0, "step", /*step*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input0, /*value*/ ctx[0]);
    			}

    			if (dirty & /*step*/ 8) {
    				attr_dev(input1, "step", /*step*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1 && to_number(input1.value) !== /*value*/ ctx[0]) {
    				set_input_value(input1, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(slider);
    			/*input0_binding*/ ctx[9](null);
    			/*input1_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let current$1;

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	const dispatch = createEventDispatcher();
    	let { value } = $$props;
    	let { min = 0 } = $$props;
    	let { max } = $$props;
    	let { step = 1 } = $$props;
    	let numberElement;
    	let rangeElement;

    	function updateValues() {
    		//value = parseFloat(this.value);
    		dispatch("input");
    	}

    	function onChange() {
    		dispatch("change");
    	}

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<Slider> was created without expected prop 'value'");
    		}

    		if (max === undefined && !('max' in $$props || $$self.$$.bound[$$self.$$.props['max']])) {
    			console.warn("<Slider> was created without expected prop 'max'");
    		}
    	});

    	const writable_props = ['value', 'min', 'max', 'step'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function input0_change_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			rangeElement = $$value;
    			$$invalidate(5, rangeElement);
    		});
    	}

    	function input1_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			numberElement = $$value;
    			$$invalidate(4, numberElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('min' in $$props) $$invalidate(1, min = $$props.min);
    		if ('max' in $$props) $$invalidate(2, max = $$props.max);
    		if ('step' in $$props) $$invalidate(3, step = $$props.step);
    	};

    	$$self.$capture_state = () => ({
    		current: current$1,
    		createEventDispatcher,
    		dispatch,
    		value,
    		min,
    		max,
    		step,
    		numberElement,
    		rangeElement,
    		updateValues,
    		onChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('min' in $$props) $$invalidate(1, min = $$props.min);
    		if ('max' in $$props) $$invalidate(2, max = $$props.max);
    		if ('step' in $$props) $$invalidate(3, step = $$props.step);
    		if ('numberElement' in $$props) $$invalidate(4, numberElement = $$props.numberElement);
    		if ('rangeElement' in $$props) $$invalidate(5, rangeElement = $$props.rangeElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		min,
    		max,
    		step,
    		numberElement,
    		rangeElement,
    		updateValues,
    		onChange,
    		input0_change_input_handler,
    		input0_binding,
    		input1_input_handler,
    		input1_binding
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, min: 1, max: 2, step: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		return this.$$.ctx[0];
    	}

    	set value(value) {
    		this.$$set({ value });
    		flush();
    	}

    	get min() {
    		return this.$$.ctx[1];
    	}

    	set min(min) {
    		this.$$set({ min });
    		flush();
    	}

    	get max() {
    		return this.$$.ctx[2];
    	}

    	set max(max) {
    		this.$$set({ max });
    		flush();
    	}

    	get step() {
    		return this.$$.ctx[3];
    	}

    	set step(step) {
    		this.$$set({ step });
    		flush();
    	}
    }

    function drawComponent(ctx, component, centerX, centerY, width, height, angle=0, opacity=100, hueshift=0) {
        if (width <= 0 || height <= 0 || opacity <= 0) return;

        ctx.restore();
        ctx.save();
        
        ctx.translate(centerX, centerY);
        ctx.rotate(angle * Math.PI / 180); // degrees
        ctx.globalAlpha = opacity / 100;
        ctx.globalCompositeOperation = "screen";
        if (hueshift > 0 || hueshift < 0) ctx.filter = `hue-rotate(${hueshift}deg)`;
        ctx.drawImage(component.canvas, -width / 2, -height / 2, width, height);

        ctx.restore();
        ctx.save();
    }

    var drawComponent_1 = drawComponent;

    function canvasClickDrag(node) {
        var mouseDown = false;
        var relMousePos = { x: 0, y: 0 };
        var setMousePos = (e) => {
            var hitbox = node.getBoundingClientRect();
            var truePos = {
                x: e.clientX - hitbox.x,
                y: e.clientY - hitbox.y
            };
            var scale = hitbox.width / node.width;
            relMousePos.x = Math.round(truePos.x / scale);
            relMousePos.y = Math.round(truePos.y / scale);
        };
        var dispatchEvt = () => {
            node.dispatchEvent(
                new CustomEvent("clickDrag", {
                    detail: relMousePos
                })
            );
        };
        var handleMouseDown = (e) => {
            mouseDown = true;
            setMousePos(e);
            dispatchEvt();
        };
        var handleMouseUp = (e) => {
            mouseDown = false;
        };
        var handleMouseMove = (e) => {
            if (mouseDown) {
                setMousePos(e);
                dispatchEvt();
            }
        };
        node.addEventListener("mousedown", handleMouseDown);
        document.body.addEventListener("mousemove", handleMouseMove);
        document.body.addEventListener("mouseup", handleMouseUp);
        return {
            destroy() {
                node.removeEventListener("mousedown", handleMouseDown);
                document.body.removeEventListener("mousemove", handleMouseMove);
                document.body.removeEventListener("mouseup", handleMouseUp);
            }
        };
    }

    var canvasClickDrag_1 = canvasClickDrag;

    class IrisComponent {
        canvas = document.createElement("canvas");
        radius = 512;
        options = {
            roundness: 20,
            sides: 5,
            fillAlpha: 25,
            fringeAlpha: 50,
            fringeSize: 10,
            hue: 200,
            saturation: 100,
            blur: 5,
            angle: 0,
        };

        setOptions(options) {
            for (var opt in options) {
                this.options[opt] = options[opt];
            }
        }

        constructor(radius, options) {
            this.radius = radius;
            this.setOptions(options);
        }

        render() {
            this.canvas.width = this.radius * 2;
            this.canvas.height = this.radius * 2;
            
            var ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.beginPath();

            var polarPoints = []; // [r, theta]
            var startAngle = this.options.angle * Math.PI / 180;
            for (var i = 0; i < this.options.sides; i++) {
                polarPoints.push([this.radius, startAngle]);
                var r1, r = this.radius, theta = 0;
                var resolution = 360;
                for (var j = 0; j < resolution; j++) {
                    theta += 1 / resolution * (Math.PI * 2 / this.options.sides);
                    r1 = this.radius / Math.sin(Math.PI - theta - 0.5 * (Math.PI - 2 * Math.PI / this.options.sides)) * Math.sin(0.5 * (Math.PI - 2 * Math.PI / this.options.sides));
                    r = r1 * (1 - this.options.roundness / 100) + this.radius * (this.options.roundness / 100);
                    polarPoints.push([r, startAngle + theta]);
                }
                startAngle += Math.PI * 2 / this.options.sides;
            }

            //console.log(polarPoints);
            var firstPoint = true;
            for (var pt of polarPoints) {
                var r = pt[0], theta = pt[1];
                var x = Math.cos(theta) * r + this.radius, y = Math.sin(theta) * r + this.radius;
                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                }
                else ctx.lineTo(x, y);
            }
            
            ctx.fillStyle = `hsl(0deg, 0%, ${this.options.fringeAlpha}%)`;
            ctx.fill();
            ctx.restore();
            ctx.save();

            ctx.fillStyle = "black";
            ctx.filter = `blur(${this.options.fringeSize}px)`;
            ctx.fill();
            ctx.restore();
            ctx.save();

            ctx.fillStyle = "white";
            ctx.globalAlpha = this.options.fillAlpha / 100;
            ctx.fill();
            ctx.restore();
            ctx.save();

            var blurBuff = document.createElement("canvas");
            blurBuff.width = this.canvas.width; blurBuff.height = this.canvas.height;
            blurBuff.getContext("2d").drawImage(this.canvas, 0, 0);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.filter = `blur(${this.options.blur}px)`;
            ctx.drawImage(blurBuff, this.options.blur, this.options.blur, this.canvas.width - 2 * this.options.blur, this.canvas.height - 2 * this.options.blur);
            ctx.restore();
            ctx.save();
            
            colorvibrance_1(ctx, this.options.hue, this.options.saturation);
            ctx.restore();
            ctx.save();
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var alea = createCommonjsModule(function (module) {
    // A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
    // http://baagoe.com/en/RandomMusings/javascript/
    // https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
    // Original work is under MIT license -

    // Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.



    (function(global, module, define) {

    function Alea(seed) {
      var me = this, mash = Mash();

      me.next = function() {
        var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
        me.s0 = me.s1;
        me.s1 = me.s2;
        return me.s2 = t - (me.c = t | 0);
      };

      // Apply the seeding algorithm from Baagoe.
      me.c = 1;
      me.s0 = mash(' ');
      me.s1 = mash(' ');
      me.s2 = mash(' ');
      me.s0 -= mash(seed);
      if (me.s0 < 0) { me.s0 += 1; }
      me.s1 -= mash(seed);
      if (me.s1 < 0) { me.s1 += 1; }
      me.s2 -= mash(seed);
      if (me.s2 < 0) { me.s2 += 1; }
      mash = null;
    }

    function copy(f, t) {
      t.c = f.c;
      t.s0 = f.s0;
      t.s1 = f.s1;
      t.s2 = f.s2;
      return t;
    }

    function impl(seed, opts) {
      var xg = new Alea(seed),
          state = opts && opts.state,
          prng = xg.next;
      prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
      prng.double = function() {
        return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    function Mash() {
      var n = 0xefc8249d;

      var mash = function(data) {
        data = String(data);
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };

      return mash;
    }


    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.alea = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    });

    var xor128 = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "xor128" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;

      // Set up generator function.
      me.next = function() {
        var t = me.x ^ (me.x << 11);
        me.x = me.y;
        me.y = me.z;
        me.z = me.w;
        return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
      };

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor128 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    });

    var xorwow = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "xorwow" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var t = (me.x ^ (me.x >>> 2));
        me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
        return (me.d = (me.d + 362437 | 0)) +
           (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
      };

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;
      me.v = 0;

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        if (k == strseed.length) {
          me.d = me.x << 10 ^ me.x >>> 4;
        }
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      t.v = f.v;
      t.d = f.d;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorwow = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    });

    var xorshift7 = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "xorshift7" algorithm by
    // François Panneton and Pierre L'ecuyer:
    // "On the Xorgshift Random Number Generators"
    // http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        // Update xor generator.
        var X = me.x, i = me.i, t, v;
        t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
        t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
        t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
        t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
        t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
        X[i] = v;
        me.i = (i + 1) & 7;
        return v;
      };

      function init(me, seed) {
        var j, X = [];

        if (seed === (seed | 0)) {
          // Seed state array using a 32-bit integer.
          X[0] = seed;
        } else {
          // Seed state using a string.
          seed = '' + seed;
          for (j = 0; j < seed.length; ++j) {
            X[j & 7] = (X[j & 7] << 15) ^
                (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
          }
        }
        // Enforce an array length of 8, not all zeroes.
        while (X.length < 8) X.push(0);
        for (j = 0; j < 8 && X[j] === 0; ++j);
        if (j == 8) X[7] = -1; else X[j];

        me.x = X;
        me.i = 0;

        // Discard an initial 256 values.
        for (j = 256; j > 0; --j) {
          me.next();
        }
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.x = f.x.slice();
      t.i = f.i;
      return t;
    }

    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.x) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorshift7 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    });

    var xor4096 = createCommonjsModule(function (module) {
    // A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
    //
    // This fast non-cryptographic random number generator is designed for
    // use in Monte-Carlo algorithms. It combines a long-period xorshift
    // generator with a Weyl generator, and it passes all common batteries
    // of stasticial tests for randomness while consuming only a few nanoseconds
    // for each prng generated.  For background on the generator, see Brent's
    // paper: "Some long-period random number generators using shifts and xors."
    // http://arxiv.org/pdf/1004.3115v1.pdf
    //
    // Usage:
    //
    // var xor4096 = require('xor4096');
    // random = xor4096(1);                        // Seed with int32 or string.
    // assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
    // assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
    //
    // For nonzero numeric keys, this impelementation provides a sequence
    // identical to that by Brent's xorgens 3 implementaion in C.  This
    // implementation also provides for initalizing the generator with
    // string seeds, or for saving and restoring the state of the generator.
    //
    // On Chrome, this prng benchmarks about 2.1 times slower than
    // Javascript's built-in Math.random().

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        var w = me.w,
            X = me.X, i = me.i, t, v;
        // Update Weyl generator.
        me.w = w = (w + 0x61c88647) | 0;
        // Update xor generator.
        v = X[(i + 34) & 127];
        t = X[i = ((i + 1) & 127)];
        v ^= v << 13;
        t ^= t << 17;
        v ^= v >>> 15;
        t ^= t >>> 12;
        // Update Xor generator array state.
        v = X[i] = v ^ t;
        me.i = i;
        // Result is the combination.
        return (v + (w ^ (w >>> 16))) | 0;
      };

      function init(me, seed) {
        var t, v, i, j, w, X = [], limit = 128;
        if (seed === (seed | 0)) {
          // Numeric seeds initialize v, which is used to generates X.
          v = seed;
          seed = null;
        } else {
          // String seeds are mixed into v and X one character at a time.
          seed = seed + '\0';
          v = 0;
          limit = Math.max(limit, seed.length);
        }
        // Initialize circular array and weyl value.
        for (i = 0, j = -32; j < limit; ++j) {
          // Put the unicode characters into the array, and shuffle them.
          if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
          // After 32 shuffles, take v as the starting w value.
          if (j === 0) w = v;
          v ^= v << 10;
          v ^= v >>> 15;
          v ^= v << 4;
          v ^= v >>> 13;
          if (j >= 0) {
            w = (w + 0x61c88647) | 0;     // Weyl.
            t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
            i = (0 == t) ? i + 1 : 0;     // Count zeroes.
          }
        }
        // We have detected all zeroes; make the key nonzero.
        if (i >= 128) {
          X[(seed && seed.length || 0) & 127] = -1;
        }
        // Run the generator 512 times to further mix the state before using it.
        // Factoring this as a function slows the main generator, so it is just
        // unrolled here.  The weyl generator is not advanced while warming up.
        i = 127;
        for (j = 4 * 128; j > 0; --j) {
          v = X[(i + 34) & 127];
          t = X[i = ((i + 1) & 127)];
          v ^= v << 13;
          t ^= t << 17;
          v ^= v >>> 15;
          t ^= t >>> 12;
          X[i] = v ^ t;
        }
        // Storing state as object members is faster than using closure variables.
        me.w = w;
        me.X = X;
        me.i = i;
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.i = f.i;
      t.w = f.w;
      t.X = f.X.slice();
      return t;
    }
    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.X) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor4096 = impl;
    }

    })(
      commonjsGlobal,                                     // window object or global
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    });

    var tychei = createCommonjsModule(function (module) {
    // A Javascript implementaion of the "Tyche-i" prng algorithm by
    // Samuel Neves and Filipe Araujo.
    // See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var b = me.b, c = me.c, d = me.d, a = me.a;
        b = (b << 25) ^ (b >>> 7) ^ c;
        c = (c - d) | 0;
        d = (d << 24) ^ (d >>> 8) ^ a;
        a = (a - b) | 0;
        me.b = b = (b << 20) ^ (b >>> 12) ^ c;
        me.c = c = (c - d) | 0;
        me.d = (d << 16) ^ (c >>> 16) ^ a;
        return me.a = (a - b) | 0;
      };

      /* The following is non-inverted tyche, which has better internal
       * bit diffusion, but which is about 25% slower than tyche-i in JS.
      me.next = function() {
        var a = me.a, b = me.b, c = me.c, d = me.d;
        a = (me.a + me.b | 0) >>> 0;
        d = me.d ^ a; d = d << 16 ^ d >>> 16;
        c = me.c + d | 0;
        b = me.b ^ c; b = b << 12 ^ d >>> 20;
        me.a = a = a + b | 0;
        d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
        me.c = c = c + d | 0;
        b = b ^ c;
        return me.b = (b << 7 ^ b >>> 25);
      }
      */

      me.a = 0;
      me.b = 0;
      me.c = 2654435769 | 0;
      me.d = 1367130551;

      if (seed === Math.floor(seed)) {
        // Integer seed.
        me.a = (seed / 0x100000000) | 0;
        me.b = seed | 0;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 20; k++) {
        me.b ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.a = f.a;
      t.b = f.b;
      t.c = f.c;
      t.d = f.d;
      return t;
    }
    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.tychei = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    });

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$0 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    /*
    Copyright 2019 David Bau.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    */

    var seedrandom$1 = createCommonjsModule(function (module) {
    (function (global, pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //

    var width = 256,        // each RC4 output is 0 <= x < 256
        chunks = 6,         // at least six RC4 outputs for each double
        digits = 52,        // there are 52 significant digits in a double
        rngname = 'random', // rngname: name for Math.random and Math.seedrandom
        startdenom = math.pow(width, chunks),
        significance = math.pow(2, digits),
        overflow = significance * 2,
        mask = width - 1,
        nodecrypto;         // node.js crypto module, initialized at the bottom.

    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    function seedrandom(seed, options, callback) {
      var key = [];
      options = (options == true) ? { entropy: true } : (options || {});

      // Flatten the seed string or build one from local entropy if needed.
      var shortseed = mixkey(flatten(
        options.entropy ? [seed, tostring(pool)] :
        (seed == null) ? autoseed() : seed, 3), key);

      // Use the seed to initialize an ARC4 generator.
      var arc4 = new ARC4(key);

      // This function returns a random double in [0, 1) that contains
      // randomness in every bit of the mantissa of the IEEE 754 value.
      var prng = function() {
        var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
            d = startdenom,                 //   and denominator d = 2 ^ 48.
            x = 0;                          //   and no 'extra last byte'.
        while (n < significance) {          // Fill up all significant digits by
          n = (n + x) * width;              //   shifting numerator and
          d *= width;                       //   denominator and generating a
          x = arc4.g(1);                    //   new least-significant-byte.
        }
        while (n >= overflow) {             // To avoid rounding up, before adding
          n /= 2;                           //   last byte, shift everything
          d /= 2;                           //   right using integer math until
          x >>>= 1;                         //   we have exactly the desired bits.
        }
        return (n + x) / d;                 // Form the number within [0, 1).
      };

      prng.int32 = function() { return arc4.g(4) | 0; };
      prng.quick = function() { return arc4.g(4) / 0x100000000; };
      prng.double = prng;

      // Mix the randomness into accumulated entropy.
      mixkey(tostring(arc4.S), pool);

      // Calling convention: what to return as a function of prng, seed, is_math.
      return (options.pass || callback ||
          function(prng, seed, is_math_call, state) {
            if (state) {
              // Load the arc4 state from the given state if it has an S array.
              if (state.S) { copy(state, arc4); }
              // Only provide the .state method if requested via options.state.
              prng.state = function() { return copy(arc4, {}); };
            }

            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) { math[rngname] = prng; return seed; }

            // Otherwise, it is a newer calling convention, so return the
            // prng directly.
            else return prng;
          })(
      prng,
      shortseed,
      'global' in options ? options.global : (this == math),
      options.state);
    }

    //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    function ARC4(key) {
      var t, keylen = key.length,
          me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

      // The empty key [] is treated as [0].
      if (!keylen) { key = [keylen++]; }

      // Set up S using the standard key scheduling algorithm.
      while (i < width) {
        s[i] = i++;
      }
      for (i = 0; i < width; i++) {
        s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
        s[j] = t;
      }

      // The "g" method returns the next (count) outputs as one number.
      (me.g = function(count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0,
            i = me.i, j = me.j, s = me.S;
        while (count--) {
          t = s[i = mask & (i + 1)];
          r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
        }
        me.i = i; me.j = j;
        return r;
        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
      })(width);
    }

    //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //
    function copy(f, t) {
      t.i = f.i;
      t.j = f.j;
      t.S = f.S.slice();
      return t;
    }
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    function flatten(obj, depth) {
      var result = [], typ = (typeof obj), prop;
      if (depth && typ == 'object') {
        for (prop in obj) {
          try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
        }
      }
      return (result.length ? result : typ == 'string' ? obj : obj + '\0');
    }

    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    function mixkey(seed, key) {
      var stringseed = seed + '', smear, j = 0;
      while (j < stringseed.length) {
        key[mask & j] =
          mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
      }
      return tostring(key);
    }

    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto and Node crypto
    // module if available.
    //
    function autoseed() {
      try {
        var out;
        if (nodecrypto && (out = nodecrypto.randomBytes)) {
          // The use of 'out' to remember randomBytes makes tight minified code.
          out = out(width);
        } else {
          out = new Uint8Array(width);
          (global.crypto || global.msCrypto).getRandomValues(out);
        }
        return tostring(out);
      } catch (e) {
        var browser = global.navigator,
            plugins = browser && browser.plugins;
        return [+new Date, global, plugins, global.screen, tostring(pool)];
      }
    }

    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    function tostring(a) {
      return String.fromCharCode.apply(0, a);
    }

    //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //
    mixkey(math.random(), pool);

    //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //
    if (module.exports) {
      module.exports = seedrandom;
      // When in node.js, try using crypto package for autoseeding.
      try {
        nodecrypto = require$$0;
      } catch (ex) {}
    } else {
      // When included as a plain script, set up Math.seedrandom global.
      math['seed' + rngname] = seedrandom;
    }


    // End anonymous scope, and pass initial values.
    })(
      // global: `self` in browsers (including strict mode and web workers),
      // otherwise `this` in Node and other environments
      (typeof self !== 'undefined') ? self : commonjsGlobal,
      [],     // pool: entropy pool starts empty
      Math    // math: package containing random, pow, and seedrandom
    );
    });

    // A library of seedable RNGs implemented in Javascript.
    //
    // Usage:
    //
    // var seedrandom = require('seedrandom');
    // var random = seedrandom(1); // or any seed.
    // var x = random();       // 0 <= x < 1.  Every bit is random.
    // var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

    // alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
    // Period: ~2^116
    // Reported to pass all BigCrush tests.


    // xor128, a pure xor-shift generator by George Marsaglia.
    // Period: 2^128-1.
    // Reported to fail: MatrixRank and LinearComp.


    // xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
    // Period: 2^192-2^32
    // Reported to fail: CollisionOver, SimpPoker, and LinearComp.


    // xorshift7, by François Panneton and Pierre L'ecuyer, takes
    // a different approach: it adds robustness by allowing more shifts
    // than Marsaglia's original three.  It is a 7-shift generator
    // with 256 bits, that passes BigCrush with no systmatic failures.
    // Period 2^256-1.
    // No systematic BigCrush failures reported.


    // xor4096, by Richard Brent, is a 4096-bit xor-shift with a
    // very long period that also adds a Weyl generator. It also passes
    // BigCrush with no systematic failures.  Its long period may
    // be useful if you have many generators and need to avoid
    // collisions.
    // Period: 2^4128-2^32.
    // No systematic BigCrush failures reported.


    // Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
    // number generator derived from ChaCha, a modern stream cipher.
    // https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
    // Period: ~2^127
    // No systematic BigCrush failures reported.


    // The original ARC4-based prng included in this library.
    // Period: ~2^1600


    seedrandom$1.alea = alea;
    seedrandom$1.xor128 = xor128;
    seedrandom$1.xorwow = xorwow;
    seedrandom$1.xorshift7 = xorshift7;
    seedrandom$1.xor4096 = xor4096;
    seedrandom$1.tychei = tychei;

    var seedrandom = seedrandom$1;

    class HalfComponent {
        canvas = document.createElement("canvas");
        
        setCanvas(canvas, width, height, leftHalf=true, rightHalf=true) {
            this.canvas.width = Math.round(width / 2) * 2;
            this.canvas.height = height;
            var ctx = this.canvas.getContext("2d");
            ctx.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height);
            if (leftHalf == false) ctx.clearRect(0, 0, this.canvas.width / 2, this.canvas.height);
            if (rightHalf == false) ctx.clearRect(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height);
        }

        constructor(canvas, width, height, leftHalf=true, rightHalf=true) {
            this.setCanvas(canvas, width, height, leftHalf, rightHalf);
        }
    }

    /* src/PresetPicker.svelte generated by Svelte v3.55.1 */
    const file$1 = "src/PresetPicker.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (45:8) {#each builtInPresets as preset}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*preset*/ ctx[8].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = JSON.stringify(/*preset*/ ctx[8].data);
    			option.value = option.__value;
    			add_location(option, file$1, 45, 12, 5223);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:8) {#each builtInPresets as preset}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let select;
    	let option0;
    	let option1;
    	let optgroup;
    	let t2;
    	let input;
    	let mounted;
    	let dispose;
    	let each_value = /*builtInPresets*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Use a Preset";
    			option1 = element("option");
    			option1.textContent = "Import .pgf2 file";
    			optgroup = element("optgroup");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			input = element("input");
    			option0.__value = "";
    			option0.value = option0.__value;
    			option0.selected = true;
    			option0.disabled = true;
    			option0.hidden = true;
    			add_location(option0, file$1, 41, 4, 4999);
    			option1.__value = "UPLOAD_PRESET";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 42, 4, 5069);
    			attr_dev(optgroup, "label", "Built-In Presets");
    			add_location(optgroup, file$1, 43, 4, 5132);
    			attr_dev(select, "class", "svelte-1cxpn51");
    			add_location(select, file$1, 40, 0, 4940);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "class", "svelte-1cxpn51");
    			add_location(input, file$1, 50, 0, 5333);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, optgroup);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(optgroup, null);
    			}

    			/*select_binding*/ ctx[5](select);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[6](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*handleChange*/ ctx[3], false, false, false),
    					listen_dev(input, "change", /*handleFileInput*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*JSON, builtInPresets*/ 4) {
    				each_value = /*builtInPresets*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(optgroup, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			/*select_binding*/ ctx[5](null);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let current;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PresetPicker', slots, []);
    	const dispatch = createEventDispatcher();
    	let dropdown;
    	let fileInput;

    	var builtInPresets = [
    		{
    			name: "Sun Digital",
    			data: {
    				"hotspot": {
    					"radius": 595,
    					"intensity": 19,
    					"deformationAmount": 1.5,
    					"deformationFrequency": 0.01,
    					"deformationSeed": 998,
    					"alpha": 100,
    					"angle": 0,
    					"hue": 39,
    					"saturation": 88,
    					"anamorph": 0
    				},
    				"streak": {
    					"thickness": 121,
    					"width": 2435,
    					"intensity": -25,
    					"count": 1,
    					"angle": 0,
    					"shift": 48,
    					"alpha": 100,
    					"hue": 216,
    					"saturation": 100
    				},
    				"ring": {
    					"radius": 300,
    					"thickness": 50,
    					"blur": 4,
    					"cropSize": 0,
    					"cropHardness": 50,
    					"alpha": 0,
    					"hue": 200,
    					"saturation": 100,
    					"anamorph": 0
    				},
    				"miIris": {
    					"radius": 81,
    					"sides": 6,
    					"roundness": 32,
    					"angle": 0,
    					"fillAlpha": 12,
    					"fringeAlpha": 25,
    					"fringeSize": 10,
    					"blur": 4,
    					"countAway": 5,
    					"countTowards": 12,
    					"spread": 30,
    					"sizeVariance": 40,
    					"perspective": 100,
    					"alphaVariance": 50,
    					"seed": 333,
    					"hue": 39,
    					"saturation": 100,
    					"hueVariance": 40,
    					"anamorph": 0
    				},
    				"glow": {
    					"radius": 999,
    					"alpha": 25,
    					"softening": 0,
    					"hue": 23,
    					"saturation": 100,
    					"anamorph": 0
    				}
    			}
    		},
    		{
    			name: "Simple Cyan",
    			data: {
    				"hotspot": {
    					"radius": 500,
    					"intensity": 5,
    					"deformationAmount": 1.6,
    					"deformationFrequency": 0.006,
    					"deformationSeed": 1,
    					"alpha": 100,
    					"angle": 0,
    					"hue": 200,
    					"saturation": 100,
    					"anamorph": 0
    				},
    				"streak": {
    					"thickness": 64,
    					"width": 1600,
    					"intensity": 5,
    					"count": 1,
    					"angle": 0,
    					"shift": 36,
    					"alpha": 100,
    					"hue": 200,
    					"saturation": 100
    				},
    				"ring": {
    					"radius": 200,
    					"thickness": 40,
    					"blur": 5,
    					"cropSize": 0,
    					"cropHardness": 50,
    					"alpha": 21,
    					"hue": 200,
    					"saturation": 100,
    					"anamorph": 0
    				},
    				"miIris": {
    					"radius": 81,
    					"sides": 5,
    					"roundness": 20,
    					"angle": 0,
    					"fillAlpha": 25,
    					"fringeAlpha": 50,
    					"fringeSize": 10,
    					"blur": 4,
    					"countAway": 5,
    					"countTowards": 12,
    					"spread": 30,
    					"sizeVariance": 40,
    					"perspective": 100,
    					"alphaVariance": 50,
    					"seed": 123,
    					"hue": 200,
    					"saturation": 100,
    					"hueVariance": 30,
    					"anamorph": 0
    				},
    				"glow": {
    					"radius": 960,
    					"alpha": 80,
    					"softening": 70,
    					"hue": 200,
    					"saturation": 100,
    					"anamorph": 0
    				}
    			}
    		},
    		{
    			name: "Flamboyant Anamorphic",
    			data: {
    				"hotspot": {
    					"radius": 802,
    					"intensity": 16,
    					"deformationAmount": 1.6,
    					"deformationFrequency": 0.006,
    					"deformationSeed": 1,
    					"alpha": 100,
    					"angle": 0,
    					"hue": 36,
    					"saturation": 100,
    					"anamorph": 42
    				},
    				"streak": {
    					"thickness": 95,
    					"width": 3210,
    					"intensity": 5,
    					"count": 1,
    					"angle": 0,
    					"shift": 54,
    					"alpha": 100,
    					"hue": 29,
    					"saturation": 81
    				},
    				"ring": {
    					"radius": 333,
    					"thickness": 67,
    					"blur": 7,
    					"cropSize": 0,
    					"cropHardness": 23,
    					"alpha": 16,
    					"hue": 12,
    					"saturation": 100,
    					"anamorph": 42
    				},
    				"miIris": {
    					"radius": 84,
    					"sides": 8,
    					"roundness": 24,
    					"angle": 24,
    					"fillAlpha": 17,
    					"fringeAlpha": 41,
    					"fringeSize": 10,
    					"blur": 4,
    					"countAway": 8,
    					"countTowards": 15,
    					"spread": 25,
    					"sizeVariance": 40,
    					"perspective": 100,
    					"alphaVariance": 50,
    					"seed": 285,
    					"hue": 29,
    					"saturation": 100,
    					"hueVariance": 44,
    					"anamorph": 35
    				},
    				"glow": {
    					"radius": 1117,
    					"alpha": 44,
    					"softening": 26,
    					"hue": 10,
    					"saturation": 100,
    					"anamorph": 0
    				}
    			}
    		},
    		{
    			name: "Sea of Fog",
    			data: {
    				"hotspot": {
    					"radius": 372,
    					"intensity": 21,
    					"deformationAmount": 0.76,
    					"deformationFrequency": 0.01,
    					"deformationSeed": 157,
    					"alpha": 100,
    					"angle": 0,
    					"hue": 287,
    					"saturation": 48,
    					"anamorph": 0
    				},
    				"streak": {
    					"thickness": 81,
    					"width": 2145,
    					"intensity": 10,
    					"count": 1,
    					"angle": 0,
    					"shift": 45,
    					"alpha": 100,
    					"hue": 279,
    					"saturation": 54
    				},
    				"ring": {
    					"radius": 356,
    					"thickness": 42,
    					"blur": 4,
    					"cropSize": 543,
    					"cropHardness": 35,
    					"alpha": 100,
    					"hue": 281,
    					"saturation": 67,
    					"anamorph": 0
    				},
    				"miIris": {
    					"radius": 81,
    					"sides": 5,
    					"roundness": 20,
    					"angle": 54,
    					"fillAlpha": 21,
    					"fringeAlpha": 21,
    					"fringeSize": 19,
    					"blur": 3,
    					"countAway": 5,
    					"countTowards": 12,
    					"spread": 30,
    					"sizeVariance": 40,
    					"perspective": 100,
    					"alphaVariance": 50,
    					"seed": 342,
    					"hue": 283,
    					"saturation": 100,
    					"hueVariance": 20,
    					"anamorph": 0
    				},
    				"glow": {
    					"radius": 1101,
    					"alpha": 20,
    					"softening": 70,
    					"hue": 281,
    					"saturation": 100,
    					"anamorph": 0
    				}
    			}
    		},
    		{
    			name: "Interstellar",
    			data: {
    				"hotspot": {
    					"radius": 288,
    					"intensity": 12,
    					"deformationAmount": 0.87,
    					"deformationFrequency": 0.01,
    					"deformationSeed": 290,
    					"alpha": 100,
    					"angle": 0,
    					"hue": 31,
    					"saturation": 49,
    					"anamorph": 0
    				},
    				"streak": {
    					"thickness": 46,
    					"width": 1028,
    					"intensity": -10,
    					"count": 5,
    					"angle": 21,
    					"shift": 32,
    					"alpha": 100,
    					"hue": 47,
    					"saturation": 14
    				},
    				"ring": {
    					"radius": 200,
    					"thickness": 40,
    					"blur": 5,
    					"cropSize": 0,
    					"cropHardness": 50,
    					"alpha": 0,
    					"hue": 200,
    					"saturation": 100,
    					"anamorph": 0
    				},
    				"miIris": {
    					"radius": 81,
    					"sides": 5,
    					"roundness": 42,
    					"angle": 55,
    					"fillAlpha": 9,
    					"fringeAlpha": 21,
    					"fringeSize": 10,
    					"blur": 4,
    					"countAway": 8,
    					"countTowards": 15,
    					"spread": 28,
    					"sizeVariance": 53,
    					"perspective": 100,
    					"alphaVariance": 71,
    					"seed": 342,
    					"hue": 222,
    					"saturation": 26,
    					"hueVariance": 102,
    					"anamorph": 0
    				},
    				"glow": {
    					"radius": 1064,
    					"alpha": 44,
    					"softening": 70,
    					"hue": 188,
    					"saturation": 58,
    					"anamorph": 0
    				}
    			}
    		}
    	];

    	function handleChange() {
    		if (this.value == "UPLOAD_PRESET") {
    			fileInput.click();
    		} else {
    			dispatch("choose", JSON.parse(this.value));
    		}

    		this.value = "";
    	}

    	function handleFileInput() {
    		var file = this.files[0];
    		var fR = new FileReader();

    		fR.addEventListener("loadend", function (e) {
    			dispatch("choose", JSON.parse(e.target.result));
    		});

    		fR.readAsText(file);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PresetPicker> was created with unknown prop '${key}'`);
    	});

    	function select_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dropdown = $$value;
    			$$invalidate(0, dropdown);
    			$$invalidate(2, builtInPresets);
    		});
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileInput = $$value;
    			$$invalidate(1, fileInput);
    		});
    	}

    	$$self.$capture_state = () => ({
    		current,
    		createEventDispatcher,
    		dispatch,
    		dropdown,
    		fileInput,
    		builtInPresets,
    		handleChange,
    		handleFileInput
    	});

    	$$self.$inject_state = $$props => {
    		if ('dropdown' in $$props) $$invalidate(0, dropdown = $$props.dropdown);
    		if ('fileInput' in $$props) $$invalidate(1, fileInput = $$props.fileInput);
    		if ('builtInPresets' in $$props) $$invalidate(2, builtInPresets = $$props.builtInPresets);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dropdown,
    		fileInput,
    		builtInPresets,
    		handleChange,
    		handleFileInput,
    		select_binding,
    		input_binding
    	];
    }

    class PresetPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PresetPicker",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.55.1 */
    const file = "src/App.svelte";

    // (298:0) <Collapsible title={"Positioning"} collapsed={false}>
    function create_default_slot_5(ctx) {
    	let t0;
    	let slider0;
    	let updating_value;
    	let t1;
    	let br0;
    	let t2;
    	let slider1;
    	let updating_value_1;
    	let t3;
    	let br1;
    	let t4;
    	let slider2;
    	let updating_value_2;
    	let t5;
    	let br2;
    	let t6;
    	let slider3;
    	let updating_value_3;
    	let t7;
    	let br3;
    	let current;

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[15](value);
    	}

    	let slider0_props = {
    		min: 0,
    		max: /*flareSettings*/ ctx[0].dimensions.width
    	};

    	if (/*flareSettings*/ ctx[0].positioning.x !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].positioning.x;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding));
    	slider0.$on("input", /*input_handler*/ ctx[16]);

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[17](value);
    	}

    	let slider1_props = {
    		min: 0,
    		max: /*flareSettings*/ ctx[0].dimensions.height
    	};

    	if (/*flareSettings*/ ctx[0].positioning.y !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].positioning.y;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding));
    	slider1.$on("input", /*input_handler_1*/ ctx[18]);

    	function slider2_value_binding(value) {
    		/*slider2_value_binding*/ ctx[19](value);
    	}

    	let slider2_props = {
    		min: 0,
    		max: /*flareSettings*/ ctx[0].dimensions.width
    	};

    	if (/*flareSettings*/ ctx[0].positioning.pivotX !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].positioning.pivotX;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding));
    	slider2.$on("input", /*input_handler_2*/ ctx[20]);

    	function slider3_value_binding(value) {
    		/*slider3_value_binding*/ ctx[21](value);
    	}

    	let slider3_props = {
    		min: 0,
    		max: /*flareSettings*/ ctx[0].dimensions.height
    	};

    	if (/*flareSettings*/ ctx[0].positioning.pivotY !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].positioning.pivotY;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding));
    	slider3.$on("input", /*input_handler_3*/ ctx[22]);

    	const block = {
    		c: function create() {
    			t0 = text("X: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Y: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Pivot X: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Pivot Y: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			add_location(br0, file, 298, 145, 15126);
    			add_location(br1, file, 299, 146, 15279);
    			add_location(br2, file, 300, 156, 15442);
    			add_location(br3, file, 301, 157, 15606);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slider1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(slider2, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(slider3, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};
    			if (dirty[0] & /*flareSettings*/ 1) slider0_changes.max = /*flareSettings*/ ctx[0].dimensions.width;

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].positioning.x;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};
    			if (dirty[0] & /*flareSettings*/ 1) slider1_changes.max = /*flareSettings*/ ctx[0].dimensions.height;

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].positioning.y;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};
    			if (dirty[0] & /*flareSettings*/ 1) slider2_changes.max = /*flareSettings*/ ctx[0].dimensions.width;

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].positioning.pivotX;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};
    			if (dirty[0] & /*flareSettings*/ 1) slider3_changes.max = /*flareSettings*/ ctx[0].dimensions.height;

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].positioning.pivotY;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			destroy_component(slider1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_component(slider2, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t6);
    			destroy_component(slider3, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(298:0) <Collapsible title={\\\"Positioning\\\"} collapsed={false}>",
    		ctx
    	});

    	return block;
    }

    // (304:0) <Collapsible title={"Hotspot"}>
    function create_default_slot_4(ctx) {
    	let t0;
    	let slider0;
    	let updating_value;
    	let t1;
    	let br0;
    	let t2;
    	let slider1;
    	let updating_value_1;
    	let t3;
    	let br1;
    	let t4;
    	let slider2;
    	let updating_value_2;
    	let t5;
    	let br2;
    	let t6;
    	let slider3;
    	let updating_value_3;
    	let t7;
    	let br3;
    	let t8;
    	let slider4;
    	let updating_value_4;
    	let t9;
    	let br4;
    	let t10;
    	let slider5;
    	let updating_value_5;
    	let t11;
    	let br5;
    	let t12;
    	let slider6;
    	let updating_value_6;
    	let t13;
    	let br6;
    	let t14;
    	let slider7;
    	let updating_value_7;
    	let t15;
    	let br7;
    	let t16;
    	let slider8;
    	let updating_value_8;
    	let t17;
    	let br8;
    	let t18;
    	let slider9;
    	let updating_value_9;
    	let t19;
    	let br9;
    	let current;

    	function slider0_value_binding_1(value) {
    		/*slider0_value_binding_1*/ ctx[23](value);
    	}

    	let slider0_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].hotspot.alpha !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].hotspot.alpha;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_1));
    	slider0.$on("input", /*input_handler_4*/ ctx[24]);

    	function slider1_value_binding_1(value) {
    		/*slider1_value_binding_1*/ ctx[25](value);
    	}

    	let slider1_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].hotspot.angle !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].hotspot.angle;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_1));
    	slider1.$on("input", /*input_handler_5*/ ctx[26]);

    	function slider2_value_binding_1(value) {
    		/*slider2_value_binding_1*/ ctx[27](value);
    	}

    	let slider2_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].hotspot.hue !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].hotspot.hue;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding_1));
    	slider2.$on("input", /*input_handler_6*/ ctx[28]);

    	function slider3_value_binding_1(value) {
    		/*slider3_value_binding_1*/ ctx[29](value);
    	}

    	let slider3_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].hotspot.saturation !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].hotspot.saturation;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding_1));
    	slider3.$on("input", /*input_handler_7*/ ctx[30]);

    	function slider4_value_binding(value) {
    		/*slider4_value_binding*/ ctx[31](value);
    	}

    	let slider4_props = { min: 0, max: 900 };

    	if (/*flareSettings*/ ctx[0].hotspot.radius !== void 0) {
    		slider4_props.value = /*flareSettings*/ ctx[0].hotspot.radius;
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, 'value', slider4_value_binding));
    	slider4.$on("input", /*input_handler_8*/ ctx[32]);

    	function slider5_value_binding(value) {
    		/*slider5_value_binding*/ ctx[33](value);
    	}

    	let slider5_props = { min: 0, max: 50 };

    	if (/*flareSettings*/ ctx[0].hotspot.intensity !== void 0) {
    		slider5_props.value = /*flareSettings*/ ctx[0].hotspot.intensity;
    	}

    	slider5 = new Slider({ props: slider5_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider5, 'value', slider5_value_binding));
    	slider5.$on("input", /*input_handler_9*/ ctx[34]);

    	function slider6_value_binding(value) {
    		/*slider6_value_binding*/ ctx[35](value);
    	}

    	let slider6_props = { min: 0, max: 0.05, step: 0.001 };

    	if (/*flareSettings*/ ctx[0].hotspot.deformationFrequency !== void 0) {
    		slider6_props.value = /*flareSettings*/ ctx[0].hotspot.deformationFrequency;
    	}

    	slider6 = new Slider({ props: slider6_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider6, 'value', slider6_value_binding));
    	slider6.$on("input", /*input_handler_10*/ ctx[36]);

    	function slider7_value_binding(value) {
    		/*slider7_value_binding*/ ctx[37](value);
    	}

    	let slider7_props = { min: 0, max: 2.1, step: 0.01 };

    	if (/*flareSettings*/ ctx[0].hotspot.deformationAmount !== void 0) {
    		slider7_props.value = /*flareSettings*/ ctx[0].hotspot.deformationAmount;
    	}

    	slider7 = new Slider({ props: slider7_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider7, 'value', slider7_value_binding));
    	slider7.$on("input", /*input_handler_11*/ ctx[38]);

    	function slider8_value_binding(value) {
    		/*slider8_value_binding*/ ctx[39](value);
    	}

    	let slider8_props = { min: 1, max: 999 };

    	if (/*flareSettings*/ ctx[0].hotspot.deformationSeed !== void 0) {
    		slider8_props.value = /*flareSettings*/ ctx[0].hotspot.deformationSeed;
    	}

    	slider8 = new Slider({ props: slider8_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider8, 'value', slider8_value_binding));
    	slider8.$on("input", /*input_handler_12*/ ctx[40]);

    	function slider9_value_binding(value) {
    		/*slider9_value_binding*/ ctx[41](value);
    	}

    	let slider9_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].hotspot.anamorph !== void 0) {
    		slider9_props.value = /*flareSettings*/ ctx[0].hotspot.anamorph;
    	}

    	slider9 = new Slider({ props: slider9_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider9, 'value', slider9_value_binding));
    	slider9.$on("input", /*input_handler_13*/ ctx[42]);

    	const block = {
    		c: function create() {
    			t0 = text("Alpha: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Angle: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Hue: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Saturation: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			t8 = text("\n    Size: ");
    			create_component(slider4.$$.fragment);
    			t9 = space();
    			br4 = element("br");
    			t10 = text("\n    Intensity: ");
    			create_component(slider5.$$.fragment);
    			t11 = space();
    			br5 = element("br");
    			t12 = text("\n    Rays Frequency: ");
    			create_component(slider6.$$.fragment);
    			t13 = space();
    			br6 = element("br");
    			t14 = text("\n    Rays Definition: ");
    			create_component(slider7.$$.fragment);
    			t15 = space();
    			br7 = element("br");
    			t16 = text("\n    Seed: ");
    			create_component(slider8.$$.fragment);
    			t17 = space();
    			br8 = element("br");
    			t18 = text("\n    Anamorph: ");
    			create_component(slider9.$$.fragment);
    			t19 = space();
    			br9 = element("br");
    			add_location(br0, file, 304, 126, 15786);
    			add_location(br1, file, 305, 126, 15919);
    			add_location(br2, file, 306, 122, 16048);
    			add_location(br3, file, 307, 136, 16191);
    			add_location(br4, file, 308, 126, 16324);
    			add_location(br5, file, 309, 133, 16464);
    			add_location(br6, file, 310, 164, 16635);
    			add_location(br7, file, 311, 160, 16802);
    			add_location(br8, file, 312, 135, 16944);
    			add_location(br9, file, 313, 132, 17083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slider1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(slider2, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(slider3, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(slider4, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(slider5, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(slider6, target, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(slider7, target, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(slider8, target, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t18, anchor);
    			mount_component(slider9, target, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, br9, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].hotspot.alpha;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].hotspot.angle;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].hotspot.hue;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].hotspot.saturation;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const slider4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_4 = true;
    				slider4_changes.value = /*flareSettings*/ ctx[0].hotspot.radius;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			slider4.$set(slider4_changes);
    			const slider5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_5 = true;
    				slider5_changes.value = /*flareSettings*/ ctx[0].hotspot.intensity;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			slider5.$set(slider5_changes);
    			const slider6_changes = {};

    			if (!updating_value_6 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_6 = true;
    				slider6_changes.value = /*flareSettings*/ ctx[0].hotspot.deformationFrequency;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			slider6.$set(slider6_changes);
    			const slider7_changes = {};

    			if (!updating_value_7 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_7 = true;
    				slider7_changes.value = /*flareSettings*/ ctx[0].hotspot.deformationAmount;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			slider7.$set(slider7_changes);
    			const slider8_changes = {};

    			if (!updating_value_8 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_8 = true;
    				slider8_changes.value = /*flareSettings*/ ctx[0].hotspot.deformationSeed;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			slider8.$set(slider8_changes);
    			const slider9_changes = {};

    			if (!updating_value_9 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_9 = true;
    				slider9_changes.value = /*flareSettings*/ ctx[0].hotspot.anamorph;
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			slider9.$set(slider9_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			transition_in(slider4.$$.fragment, local);
    			transition_in(slider5.$$.fragment, local);
    			transition_in(slider6.$$.fragment, local);
    			transition_in(slider7.$$.fragment, local);
    			transition_in(slider8.$$.fragment, local);
    			transition_in(slider9.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			transition_out(slider4.$$.fragment, local);
    			transition_out(slider5.$$.fragment, local);
    			transition_out(slider6.$$.fragment, local);
    			transition_out(slider7.$$.fragment, local);
    			transition_out(slider8.$$.fragment, local);
    			transition_out(slider9.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			destroy_component(slider1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_component(slider2, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t6);
    			destroy_component(slider3, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t8);
    			destroy_component(slider4, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t10);
    			destroy_component(slider5, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t12);
    			destroy_component(slider6, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t14);
    			destroy_component(slider7, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t16);
    			destroy_component(slider8, detaching);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t18);
    			destroy_component(slider9, detaching);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(br9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(304:0) <Collapsible title={\\\"Hotspot\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (316:0) <Collapsible title={"Streak"}>
    function create_default_slot_3(ctx) {
    	let t0;
    	let slider0;
    	let updating_value;
    	let t1;
    	let br0;
    	let t2;
    	let slider1;
    	let updating_value_1;
    	let t3;
    	let br1;
    	let t4;
    	let slider2;
    	let updating_value_2;
    	let t5;
    	let br2;
    	let t6;
    	let slider3;
    	let updating_value_3;
    	let t7;
    	let br3;
    	let t8;
    	let slider4;
    	let updating_value_4;
    	let t9;
    	let br4;
    	let t10;
    	let slider5;
    	let updating_value_5;
    	let t11;
    	let br5;
    	let t12;
    	let slider6;
    	let updating_value_6;
    	let t13;
    	let br6;
    	let t14;
    	let slider7;
    	let updating_value_7;
    	let t15;
    	let br7;
    	let t16;
    	let slider8;
    	let updating_value_8;
    	let t17;
    	let br8;
    	let current;

    	function slider0_value_binding_2(value) {
    		/*slider0_value_binding_2*/ ctx[43](value);
    	}

    	let slider0_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].streak.alpha !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].streak.alpha;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_2));
    	slider0.$on("input", /*input_handler_14*/ ctx[44]);

    	function slider1_value_binding_2(value) {
    		/*slider1_value_binding_2*/ ctx[45](value);
    	}

    	let slider1_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].streak.angle !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].streak.angle;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_2));
    	slider1.$on("input", /*input_handler_15*/ ctx[46]);

    	function slider2_value_binding_2(value) {
    		/*slider2_value_binding_2*/ ctx[47](value);
    	}

    	let slider2_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].streak.hue !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].streak.hue;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding_2));
    	slider2.$on("input", /*input_handler_16*/ ctx[48]);

    	function slider3_value_binding_2(value) {
    		/*slider3_value_binding_2*/ ctx[49](value);
    	}

    	let slider3_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].streak.saturation !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].streak.saturation;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding_2));
    	slider3.$on("input", /*input_handler_17*/ ctx[50]);

    	function slider4_value_binding_1(value) {
    		/*slider4_value_binding_1*/ ctx[51](value);
    	}

    	let slider4_props = { min: 0, max: 200 };

    	if (/*flareSettings*/ ctx[0].streak.thickness !== void 0) {
    		slider4_props.value = /*flareSettings*/ ctx[0].streak.thickness;
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, 'value', slider4_value_binding_1));
    	slider4.$on("input", /*input_handler_18*/ ctx[52]);

    	function slider5_value_binding_1(value) {
    		/*slider5_value_binding_1*/ ctx[53](value);
    	}

    	let slider5_props = { min: 0, max: 3210 };

    	if (/*flareSettings*/ ctx[0].streak.width !== void 0) {
    		slider5_props.value = /*flareSettings*/ ctx[0].streak.width;
    	}

    	slider5 = new Slider({ props: slider5_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider5, 'value', slider5_value_binding_1));
    	slider5.$on("input", /*input_handler_19*/ ctx[54]);

    	function slider6_value_binding_1(value) {
    		/*slider6_value_binding_1*/ ctx[55](value);
    	}

    	let slider6_props = { min: -25, max: 50 };

    	if (/*flareSettings*/ ctx[0].streak.intensity !== void 0) {
    		slider6_props.value = /*flareSettings*/ ctx[0].streak.intensity;
    	}

    	slider6 = new Slider({ props: slider6_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider6, 'value', slider6_value_binding_1));
    	slider6.$on("input", /*input_handler_20*/ ctx[56]);

    	function slider7_value_binding_1(value) {
    		/*slider7_value_binding_1*/ ctx[57](value);
    	}

    	let slider7_props = { min: 1, max: 8 };

    	if (/*flareSettings*/ ctx[0].streak.count !== void 0) {
    		slider7_props.value = /*flareSettings*/ ctx[0].streak.count;
    	}

    	slider7 = new Slider({ props: slider7_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider7, 'value', slider7_value_binding_1));
    	slider7.$on("input", /*input_handler_21*/ ctx[58]);

    	function slider8_value_binding_1(value) {
    		/*slider8_value_binding_1*/ ctx[59](value);
    	}

    	let slider8_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].streak.shift !== void 0) {
    		slider8_props.value = /*flareSettings*/ ctx[0].streak.shift;
    	}

    	slider8 = new Slider({ props: slider8_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider8, 'value', slider8_value_binding_1));
    	slider8.$on("input", /*input_handler_22*/ ctx[60]);

    	const block = {
    		c: function create() {
    			t0 = text("Alpha: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Angle: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Hue: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Saturation: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			t8 = text("\n    Thickness: ");
    			create_component(slider4.$$.fragment);
    			t9 = space();
    			br4 = element("br");
    			t10 = text("\n    Length: ");
    			create_component(slider5.$$.fragment);
    			t11 = space();
    			br5 = element("br");
    			t12 = text("\n    Intensity: ");
    			create_component(slider6.$$.fragment);
    			t13 = space();
    			br6 = element("br");
    			t14 = text("\n    Starring: ");
    			create_component(slider7.$$.fragment);
    			t15 = space();
    			br7 = element("br");
    			t16 = text("\n    Shift: ");
    			create_component(slider8.$$.fragment);
    			t17 = space();
    			br8 = element("br");
    			add_location(br0, file, 316, 132, 17268);
    			add_location(br1, file, 317, 132, 17407);
    			add_location(br2, file, 318, 128, 17542);
    			add_location(br3, file, 319, 142, 17691);
    			add_location(br4, file, 320, 140, 17838);
    			add_location(br5, file, 321, 134, 17979);
    			add_location(br6, file, 322, 141, 18127);
    			add_location(br7, file, 323, 133, 18267);
    			add_location(br8, file, 324, 132, 18406);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slider1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(slider2, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(slider3, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(slider4, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(slider5, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(slider6, target, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(slider7, target, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(slider8, target, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, br8, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].streak.alpha;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].streak.angle;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].streak.hue;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].streak.saturation;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const slider4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_4 = true;
    				slider4_changes.value = /*flareSettings*/ ctx[0].streak.thickness;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			slider4.$set(slider4_changes);
    			const slider5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_5 = true;
    				slider5_changes.value = /*flareSettings*/ ctx[0].streak.width;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			slider5.$set(slider5_changes);
    			const slider6_changes = {};

    			if (!updating_value_6 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_6 = true;
    				slider6_changes.value = /*flareSettings*/ ctx[0].streak.intensity;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			slider6.$set(slider6_changes);
    			const slider7_changes = {};

    			if (!updating_value_7 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_7 = true;
    				slider7_changes.value = /*flareSettings*/ ctx[0].streak.count;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			slider7.$set(slider7_changes);
    			const slider8_changes = {};

    			if (!updating_value_8 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_8 = true;
    				slider8_changes.value = /*flareSettings*/ ctx[0].streak.shift;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			slider8.$set(slider8_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			transition_in(slider4.$$.fragment, local);
    			transition_in(slider5.$$.fragment, local);
    			transition_in(slider6.$$.fragment, local);
    			transition_in(slider7.$$.fragment, local);
    			transition_in(slider8.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			transition_out(slider4.$$.fragment, local);
    			transition_out(slider5.$$.fragment, local);
    			transition_out(slider6.$$.fragment, local);
    			transition_out(slider7.$$.fragment, local);
    			transition_out(slider8.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			destroy_component(slider1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_component(slider2, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t6);
    			destroy_component(slider3, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t8);
    			destroy_component(slider4, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t10);
    			destroy_component(slider5, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t12);
    			destroy_component(slider6, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t14);
    			destroy_component(slider7, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t16);
    			destroy_component(slider8, detaching);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(br8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(316:0) <Collapsible title={\\\"Streak\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (327:0) <Collapsible title={"Ring"}>
    function create_default_slot_2(ctx) {
    	let t0;
    	let slider0;
    	let updating_value;
    	let t1;
    	let br0;
    	let t2;
    	let slider1;
    	let updating_value_1;
    	let t3;
    	let br1;
    	let t4;
    	let slider2;
    	let updating_value_2;
    	let t5;
    	let br2;
    	let t6;
    	let slider3;
    	let updating_value_3;
    	let t7;
    	let br3;
    	let t8;
    	let slider4;
    	let updating_value_4;
    	let t9;
    	let br4;
    	let t10;
    	let slider5;
    	let updating_value_5;
    	let t11;
    	let br5;
    	let t12;
    	let slider6;
    	let updating_value_6;
    	let t13;
    	let br6;
    	let t14;
    	let slider7;
    	let updating_value_7;
    	let t15;
    	let br7;
    	let t16;
    	let slider8;
    	let updating_value_8;
    	let t17;
    	let br8;
    	let current;

    	function slider0_value_binding_3(value) {
    		/*slider0_value_binding_3*/ ctx[61](value);
    	}

    	let slider0_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].ring.alpha !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].ring.alpha;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_3));
    	slider0.$on("input", /*input_handler_23*/ ctx[62]);

    	function slider1_value_binding_3(value) {
    		/*slider1_value_binding_3*/ ctx[63](value);
    	}

    	let slider1_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].ring.hue !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].ring.hue;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_3));
    	slider1.$on("input", /*input_handler_24*/ ctx[64]);

    	function slider2_value_binding_3(value) {
    		/*slider2_value_binding_3*/ ctx[65](value);
    	}

    	let slider2_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].ring.saturation !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].ring.saturation;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding_3));
    	slider2.$on("input", /*input_handler_25*/ ctx[66]);

    	function slider3_value_binding_3(value) {
    		/*slider3_value_binding_3*/ ctx[67](value);
    	}

    	let slider3_props = { min: 0, max: 810 };

    	if (/*flareSettings*/ ctx[0].ring.radius !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].ring.radius;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding_3));
    	slider3.$on("input", /*input_handler_26*/ ctx[68]);

    	function slider4_value_binding_2(value) {
    		/*slider4_value_binding_2*/ ctx[69](value);
    	}

    	let slider4_props = { min: 0, max: 500 };

    	if (/*flareSettings*/ ctx[0].ring.thickness !== void 0) {
    		slider4_props.value = /*flareSettings*/ ctx[0].ring.thickness;
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, 'value', slider4_value_binding_2));
    	slider4.$on("input", /*input_handler_27*/ ctx[70]);

    	function slider5_value_binding_2(value) {
    		/*slider5_value_binding_2*/ ctx[71](value);
    	}

    	let slider5_props = { min: 0, max: 50 };

    	if (/*flareSettings*/ ctx[0].ring.blur !== void 0) {
    		slider5_props.value = /*flareSettings*/ ctx[0].ring.blur;
    	}

    	slider5 = new Slider({ props: slider5_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider5, 'value', slider5_value_binding_2));
    	slider5.$on("input", /*input_handler_28*/ ctx[72]);

    	function slider6_value_binding_2(value) {
    		/*slider6_value_binding_2*/ ctx[73](value);
    	}

    	let slider6_props = { min: 0, max: 810 };

    	if (/*flareSettings*/ ctx[0].ring.cropSize !== void 0) {
    		slider6_props.value = /*flareSettings*/ ctx[0].ring.cropSize;
    	}

    	slider6 = new Slider({ props: slider6_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider6, 'value', slider6_value_binding_2));
    	slider6.$on("input", /*input_handler_29*/ ctx[74]);

    	function slider7_value_binding_2(value) {
    		/*slider7_value_binding_2*/ ctx[75](value);
    	}

    	let slider7_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].ring.cropHardness !== void 0) {
    		slider7_props.value = /*flareSettings*/ ctx[0].ring.cropHardness;
    	}

    	slider7 = new Slider({ props: slider7_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider7, 'value', slider7_value_binding_2));
    	slider7.$on("input", /*input_handler_30*/ ctx[76]);

    	function slider8_value_binding_2(value) {
    		/*slider8_value_binding_2*/ ctx[77](value);
    	}

    	let slider8_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].ring.anamorph !== void 0) {
    		slider8_props.value = /*flareSettings*/ ctx[0].ring.anamorph;
    	}

    	slider8 = new Slider({ props: slider8_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider8, 'value', slider8_value_binding_2));
    	slider8.$on("input", /*input_handler_31*/ ctx[78]);

    	const block = {
    		c: function create() {
    			t0 = text("Alpha: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Hue: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Saturation: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Radius: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			t8 = text("\n    Thickness: ");
    			create_component(slider4.$$.fragment);
    			t9 = space();
    			br4 = element("br");
    			t10 = text("\n    Softness: ");
    			create_component(slider5.$$.fragment);
    			t11 = space();
    			br5 = element("br");
    			t12 = text("\n    Crop Size: ");
    			create_component(slider6.$$.fragment);
    			t13 = space();
    			br6 = element("br");
    			t14 = text("\n    Crop Hardness: ");
    			create_component(slider7.$$.fragment);
    			t15 = space();
    			br7 = element("br");
    			t16 = text("\n    Anamorph: ");
    			create_component(slider8.$$.fragment);
    			t17 = space();
    			br8 = element("br");
    			add_location(br0, file, 327, 137, 18594);
    			add_location(br1, file, 328, 133, 18734);
    			add_location(br2, file, 329, 147, 18888);
    			add_location(br3, file, 330, 139, 19034);
    			add_location(br4, file, 331, 145, 19186);
    			add_location(br5, file, 332, 138, 19331);
    			add_location(br6, file, 333, 144, 19482);
    			add_location(br7, file, 334, 152, 19641);
    			add_location(br8, file, 335, 143, 19791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slider1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(slider2, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(slider3, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(slider4, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(slider5, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(slider6, target, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(slider7, target, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(slider8, target, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, br8, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].ring.alpha;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].ring.hue;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].ring.saturation;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].ring.radius;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const slider4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_4 = true;
    				slider4_changes.value = /*flareSettings*/ ctx[0].ring.thickness;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			slider4.$set(slider4_changes);
    			const slider5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_5 = true;
    				slider5_changes.value = /*flareSettings*/ ctx[0].ring.blur;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			slider5.$set(slider5_changes);
    			const slider6_changes = {};

    			if (!updating_value_6 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_6 = true;
    				slider6_changes.value = /*flareSettings*/ ctx[0].ring.cropSize;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			slider6.$set(slider6_changes);
    			const slider7_changes = {};

    			if (!updating_value_7 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_7 = true;
    				slider7_changes.value = /*flareSettings*/ ctx[0].ring.cropHardness;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			slider7.$set(slider7_changes);
    			const slider8_changes = {};

    			if (!updating_value_8 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_8 = true;
    				slider8_changes.value = /*flareSettings*/ ctx[0].ring.anamorph;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			slider8.$set(slider8_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			transition_in(slider4.$$.fragment, local);
    			transition_in(slider5.$$.fragment, local);
    			transition_in(slider6.$$.fragment, local);
    			transition_in(slider7.$$.fragment, local);
    			transition_in(slider8.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			transition_out(slider4.$$.fragment, local);
    			transition_out(slider5.$$.fragment, local);
    			transition_out(slider6.$$.fragment, local);
    			transition_out(slider7.$$.fragment, local);
    			transition_out(slider8.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			destroy_component(slider1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_component(slider2, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t6);
    			destroy_component(slider3, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t8);
    			destroy_component(slider4, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t10);
    			destroy_component(slider5, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t12);
    			destroy_component(slider6, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t14);
    			destroy_component(slider7, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t16);
    			destroy_component(slider8, detaching);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(br8);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(327:0) <Collapsible title={\\\"Ring\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (338:0) <Collapsible title={"Multi-Iris"}>
    function create_default_slot_1(ctx) {
    	let t0;
    	let slider0;
    	let updating_value;
    	let t1;
    	let br0;
    	let t2;
    	let slider1;
    	let updating_value_1;
    	let t3;
    	let br1;
    	let t4;
    	let slider2;
    	let updating_value_2;
    	let t5;
    	let br2;
    	let t6;
    	let slider3;
    	let updating_value_3;
    	let t7;
    	let br3;
    	let t8;
    	let slider4;
    	let updating_value_4;
    	let t9;
    	let br4;
    	let t10;
    	let slider5;
    	let updating_value_5;
    	let t11;
    	let br5;
    	let t12;
    	let slider6;
    	let updating_value_6;
    	let t13;
    	let br6;
    	let t14;
    	let slider7;
    	let updating_value_7;
    	let t15;
    	let br7;
    	let t16;
    	let slider8;
    	let updating_value_8;
    	let t17;
    	let br8;
    	let t18;
    	let slider9;
    	let updating_value_9;
    	let t19;
    	let br9;
    	let t20;
    	let slider10;
    	let updating_value_10;
    	let t21;
    	let br10;
    	let t22;
    	let slider11;
    	let updating_value_11;
    	let t23;
    	let br11;
    	let t24;
    	let slider12;
    	let updating_value_12;
    	let t25;
    	let br12;
    	let t26;
    	let slider13;
    	let updating_value_13;
    	let t27;
    	let br13;
    	let t28;
    	let slider14;
    	let updating_value_14;
    	let t29;
    	let br14;
    	let t30;
    	let slider15;
    	let updating_value_15;
    	let t31;
    	let br15;
    	let t32;
    	let slider16;
    	let updating_value_16;
    	let t33;
    	let br16;
    	let t34;
    	let slider17;
    	let updating_value_17;
    	let t35;
    	let br17;
    	let t36;
    	let slider18;
    	let updating_value_18;
    	let t37;
    	let br18;
    	let current;

    	function slider0_value_binding_4(value) {
    		/*slider0_value_binding_4*/ ctx[79](value);
    	}

    	let slider0_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.fillAlpha !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].miIris.fillAlpha;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_4));
    	slider0.$on("input", /*input_handler_32*/ ctx[80]);

    	function slider1_value_binding_4(value) {
    		/*slider1_value_binding_4*/ ctx[81](value);
    	}

    	let slider1_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.fringeAlpha !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].miIris.fringeAlpha;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_4));
    	slider1.$on("input", /*input_handler_33*/ ctx[82]);

    	function slider2_value_binding_4(value) {
    		/*slider2_value_binding_4*/ ctx[83](value);
    	}

    	let slider2_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].miIris.angle !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].miIris.angle;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding_4));
    	slider2.$on("input", /*input_handler_34*/ ctx[84]);

    	function slider3_value_binding_4(value) {
    		/*slider3_value_binding_4*/ ctx[85](value);
    	}

    	let slider3_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].miIris.hue !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].miIris.hue;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding_4));
    	slider3.$on("input", /*input_handler_35*/ ctx[86]);

    	function slider4_value_binding_3(value) {
    		/*slider4_value_binding_3*/ ctx[87](value);
    	}

    	let slider4_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.saturation !== void 0) {
    		slider4_props.value = /*flareSettings*/ ctx[0].miIris.saturation;
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, 'value', slider4_value_binding_3));
    	slider4.$on("input", /*input_handler_36*/ ctx[88]);

    	function slider5_value_binding_3(value) {
    		/*slider5_value_binding_3*/ ctx[89](value);
    	}

    	let slider5_props = { min: 0, max: 810 };

    	if (/*flareSettings*/ ctx[0].miIris.radius !== void 0) {
    		slider5_props.value = /*flareSettings*/ ctx[0].miIris.radius;
    	}

    	slider5 = new Slider({ props: slider5_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider5, 'value', slider5_value_binding_3));
    	slider5.$on("input", /*input_handler_37*/ ctx[90]);

    	function slider6_value_binding_3(value) {
    		/*slider6_value_binding_3*/ ctx[91](value);
    	}

    	let slider6_props = { min: 5, max: 10 };

    	if (/*flareSettings*/ ctx[0].miIris.sides !== void 0) {
    		slider6_props.value = /*flareSettings*/ ctx[0].miIris.sides;
    	}

    	slider6 = new Slider({ props: slider6_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider6, 'value', slider6_value_binding_3));
    	slider6.$on("input", /*input_handler_38*/ ctx[92]);

    	function slider7_value_binding_3(value) {
    		/*slider7_value_binding_3*/ ctx[93](value);
    	}

    	let slider7_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.roundness !== void 0) {
    		slider7_props.value = /*flareSettings*/ ctx[0].miIris.roundness;
    	}

    	slider7 = new Slider({ props: slider7_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider7, 'value', slider7_value_binding_3));
    	slider7.$on("input", /*input_handler_39*/ ctx[94]);

    	function slider8_value_binding_3(value) {
    		/*slider8_value_binding_3*/ ctx[95](value);
    	}

    	let slider8_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.fringeSize !== void 0) {
    		slider8_props.value = /*flareSettings*/ ctx[0].miIris.fringeSize;
    	}

    	slider8 = new Slider({ props: slider8_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider8, 'value', slider8_value_binding_3));
    	slider8.$on("input", /*input_handler_40*/ ctx[96]);

    	function slider9_value_binding_1(value) {
    		/*slider9_value_binding_1*/ ctx[97](value);
    	}

    	let slider9_props = { min: 0, max: 30 };

    	if (/*flareSettings*/ ctx[0].miIris.blur !== void 0) {
    		slider9_props.value = /*flareSettings*/ ctx[0].miIris.blur;
    	}

    	slider9 = new Slider({ props: slider9_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider9, 'value', slider9_value_binding_1));
    	slider9.$on("input", /*input_handler_41*/ ctx[98]);

    	function slider10_value_binding(value) {
    		/*slider10_value_binding*/ ctx[99](value);
    	}

    	let slider10_props = { min: 0, max: 50 };

    	if (/*flareSettings*/ ctx[0].miIris.countTowards !== void 0) {
    		slider10_props.value = /*flareSettings*/ ctx[0].miIris.countTowards;
    	}

    	slider10 = new Slider({ props: slider10_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider10, 'value', slider10_value_binding));
    	slider10.$on("input", /*input_handler_42*/ ctx[100]);

    	function slider11_value_binding(value) {
    		/*slider11_value_binding*/ ctx[101](value);
    	}

    	let slider11_props = { min: 0, max: 50 };

    	if (/*flareSettings*/ ctx[0].miIris.countAway !== void 0) {
    		slider11_props.value = /*flareSettings*/ ctx[0].miIris.countAway;
    	}

    	slider11 = new Slider({ props: slider11_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider11, 'value', slider11_value_binding));
    	slider11.$on("input", /*input_handler_43*/ ctx[102]);

    	function slider12_value_binding(value) {
    		/*slider12_value_binding*/ ctx[103](value);
    	}

    	let slider12_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.spread !== void 0) {
    		slider12_props.value = /*flareSettings*/ ctx[0].miIris.spread;
    	}

    	slider12 = new Slider({ props: slider12_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider12, 'value', slider12_value_binding));
    	slider12.$on("input", /*input_handler_44*/ ctx[104]);

    	function slider13_value_binding(value) {
    		/*slider13_value_binding*/ ctx[105](value);
    	}

    	let slider13_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.sizeVariance !== void 0) {
    		slider13_props.value = /*flareSettings*/ ctx[0].miIris.sizeVariance;
    	}

    	slider13 = new Slider({ props: slider13_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider13, 'value', slider13_value_binding));
    	slider13.$on("input", /*input_handler_45*/ ctx[106]);

    	function slider14_value_binding(value) {
    		/*slider14_value_binding*/ ctx[107](value);
    	}

    	let slider14_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.perspective !== void 0) {
    		slider14_props.value = /*flareSettings*/ ctx[0].miIris.perspective;
    	}

    	slider14 = new Slider({ props: slider14_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider14, 'value', slider14_value_binding));
    	slider14.$on("input", /*input_handler_46*/ ctx[108]);

    	function slider15_value_binding(value) {
    		/*slider15_value_binding*/ ctx[109](value);
    	}

    	let slider15_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.alphaVariance !== void 0) {
    		slider15_props.value = /*flareSettings*/ ctx[0].miIris.alphaVariance;
    	}

    	slider15 = new Slider({ props: slider15_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider15, 'value', slider15_value_binding));
    	slider15.$on("input", /*input_handler_47*/ ctx[110]);

    	function slider16_value_binding(value) {
    		/*slider16_value_binding*/ ctx[111](value);
    	}

    	let slider16_props = { min: 0, max: 180 };

    	if (/*flareSettings*/ ctx[0].miIris.hueVariance !== void 0) {
    		slider16_props.value = /*flareSettings*/ ctx[0].miIris.hueVariance;
    	}

    	slider16 = new Slider({ props: slider16_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider16, 'value', slider16_value_binding));
    	slider16.$on("input", /*input_handler_48*/ ctx[112]);

    	function slider17_value_binding(value) {
    		/*slider17_value_binding*/ ctx[113](value);
    	}

    	let slider17_props = { min: 0, max: 999 };

    	if (/*flareSettings*/ ctx[0].miIris.seed !== void 0) {
    		slider17_props.value = /*flareSettings*/ ctx[0].miIris.seed;
    	}

    	slider17 = new Slider({ props: slider17_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider17, 'value', slider17_value_binding));
    	slider17.$on("input", /*input_handler_49*/ ctx[114]);

    	function slider18_value_binding(value) {
    		/*slider18_value_binding*/ ctx[115](value);
    	}

    	let slider18_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].miIris.anamorph !== void 0) {
    		slider18_props.value = /*flareSettings*/ ctx[0].miIris.anamorph;
    	}

    	slider18 = new Slider({ props: slider18_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider18, 'value', slider18_value_binding));
    	slider18.$on("input", /*input_handler_50*/ ctx[116]);

    	const block = {
    		c: function create() {
    			t0 = text("Fill Alpha: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Fringe Alpha: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Angle: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Hue: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			t8 = text("\n    Saturation: ");
    			create_component(slider4.$$.fragment);
    			t9 = space();
    			br4 = element("br");
    			t10 = text("\n    Radius: ");
    			create_component(slider5.$$.fragment);
    			t11 = space();
    			br5 = element("br");
    			t12 = text("\n    Sides: ");
    			create_component(slider6.$$.fragment);
    			t13 = space();
    			br6 = element("br");
    			t14 = text("\n    Roundness: ");
    			create_component(slider7.$$.fragment);
    			t15 = space();
    			br7 = element("br");
    			t16 = text("\n    Fringe Size: ");
    			create_component(slider8.$$.fragment);
    			t17 = space();
    			br8 = element("br");
    			t18 = text("\n    Softness: ");
    			create_component(slider9.$$.fragment);
    			t19 = space();
    			br9 = element("br");
    			t20 = text("\n    Count Towards: ");
    			create_component(slider10.$$.fragment);
    			t21 = space();
    			br10 = element("br");
    			t22 = text("\n    Count Away: ");
    			create_component(slider11.$$.fragment);
    			t23 = space();
    			br11 = element("br");
    			t24 = text("\n    Spread: ");
    			create_component(slider12.$$.fragment);
    			t25 = space();
    			br12 = element("br");
    			t26 = text("\n    Size Variance: ");
    			create_component(slider13.$$.fragment);
    			t27 = space();
    			br13 = element("br");
    			t28 = text("\n    Perspective: ");
    			create_component(slider14.$$.fragment);
    			t29 = space();
    			br14 = element("br");
    			t30 = text("\n    Alpha Variance: ");
    			create_component(slider15.$$.fragment);
    			t31 = space();
    			br15 = element("br");
    			t32 = text("\n    Hue Variance: ");
    			create_component(slider16.$$.fragment);
    			t33 = space();
    			br16 = element("br");
    			t34 = text("\n    Random Seed: ");
    			create_component(slider17.$$.fragment);
    			t35 = space();
    			br17 = element("br");
    			t36 = text("\n    Anamorph: ");
    			create_component(slider18.$$.fragment);
    			t37 = space();
    			br18 = element("br");
    			add_location(br0, file, 338, 155, 20003);
    			add_location(br1, file, 339, 159, 20169);
    			add_location(br2, file, 340, 146, 20322);
    			add_location(br3, file, 341, 142, 20471);
    			add_location(br4, file, 342, 156, 20634);
    			add_location(br5, file, 343, 148, 20789);
    			add_location(br6, file, 344, 145, 20941);
    			add_location(br7, file, 345, 154, 21102);
    			add_location(br8, file, 346, 157, 21266);
    			add_location(br9, file, 347, 147, 21420);
    			add_location(br10, file, 348, 160, 21587);
    			add_location(br11, file, 349, 154, 21748);
    			add_location(br12, file, 350, 148, 21903);
    			add_location(br13, file, 351, 161, 22071);
    			add_location(br14, file, 352, 158, 22236);
    			add_location(br15, file, 353, 163, 22406);
    			add_location(br16, file, 354, 159, 22572);
    			add_location(br17, file, 355, 151, 22730);
    			add_location(br18, file, 356, 152, 22889);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slider1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(slider2, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(slider3, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(slider4, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(slider5, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br5, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(slider6, target, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, br6, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(slider7, target, anchor);
    			insert_dev(target, t15, anchor);
    			insert_dev(target, br7, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(slider8, target, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, br8, anchor);
    			insert_dev(target, t18, anchor);
    			mount_component(slider9, target, anchor);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, br9, anchor);
    			insert_dev(target, t20, anchor);
    			mount_component(slider10, target, anchor);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, br10, anchor);
    			insert_dev(target, t22, anchor);
    			mount_component(slider11, target, anchor);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, br11, anchor);
    			insert_dev(target, t24, anchor);
    			mount_component(slider12, target, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, br12, anchor);
    			insert_dev(target, t26, anchor);
    			mount_component(slider13, target, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, br13, anchor);
    			insert_dev(target, t28, anchor);
    			mount_component(slider14, target, anchor);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, br14, anchor);
    			insert_dev(target, t30, anchor);
    			mount_component(slider15, target, anchor);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, br15, anchor);
    			insert_dev(target, t32, anchor);
    			mount_component(slider16, target, anchor);
    			insert_dev(target, t33, anchor);
    			insert_dev(target, br16, anchor);
    			insert_dev(target, t34, anchor);
    			mount_component(slider17, target, anchor);
    			insert_dev(target, t35, anchor);
    			insert_dev(target, br17, anchor);
    			insert_dev(target, t36, anchor);
    			mount_component(slider18, target, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, br18, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].miIris.fillAlpha;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].miIris.fringeAlpha;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].miIris.angle;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].miIris.hue;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const slider4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_4 = true;
    				slider4_changes.value = /*flareSettings*/ ctx[0].miIris.saturation;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			slider4.$set(slider4_changes);
    			const slider5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_5 = true;
    				slider5_changes.value = /*flareSettings*/ ctx[0].miIris.radius;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			slider5.$set(slider5_changes);
    			const slider6_changes = {};

    			if (!updating_value_6 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_6 = true;
    				slider6_changes.value = /*flareSettings*/ ctx[0].miIris.sides;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			slider6.$set(slider6_changes);
    			const slider7_changes = {};

    			if (!updating_value_7 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_7 = true;
    				slider7_changes.value = /*flareSettings*/ ctx[0].miIris.roundness;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			slider7.$set(slider7_changes);
    			const slider8_changes = {};

    			if (!updating_value_8 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_8 = true;
    				slider8_changes.value = /*flareSettings*/ ctx[0].miIris.fringeSize;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			slider8.$set(slider8_changes);
    			const slider9_changes = {};

    			if (!updating_value_9 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_9 = true;
    				slider9_changes.value = /*flareSettings*/ ctx[0].miIris.blur;
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			slider9.$set(slider9_changes);
    			const slider10_changes = {};

    			if (!updating_value_10 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_10 = true;
    				slider10_changes.value = /*flareSettings*/ ctx[0].miIris.countTowards;
    				add_flush_callback(() => updating_value_10 = false);
    			}

    			slider10.$set(slider10_changes);
    			const slider11_changes = {};

    			if (!updating_value_11 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_11 = true;
    				slider11_changes.value = /*flareSettings*/ ctx[0].miIris.countAway;
    				add_flush_callback(() => updating_value_11 = false);
    			}

    			slider11.$set(slider11_changes);
    			const slider12_changes = {};

    			if (!updating_value_12 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_12 = true;
    				slider12_changes.value = /*flareSettings*/ ctx[0].miIris.spread;
    				add_flush_callback(() => updating_value_12 = false);
    			}

    			slider12.$set(slider12_changes);
    			const slider13_changes = {};

    			if (!updating_value_13 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_13 = true;
    				slider13_changes.value = /*flareSettings*/ ctx[0].miIris.sizeVariance;
    				add_flush_callback(() => updating_value_13 = false);
    			}

    			slider13.$set(slider13_changes);
    			const slider14_changes = {};

    			if (!updating_value_14 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_14 = true;
    				slider14_changes.value = /*flareSettings*/ ctx[0].miIris.perspective;
    				add_flush_callback(() => updating_value_14 = false);
    			}

    			slider14.$set(slider14_changes);
    			const slider15_changes = {};

    			if (!updating_value_15 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_15 = true;
    				slider15_changes.value = /*flareSettings*/ ctx[0].miIris.alphaVariance;
    				add_flush_callback(() => updating_value_15 = false);
    			}

    			slider15.$set(slider15_changes);
    			const slider16_changes = {};

    			if (!updating_value_16 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_16 = true;
    				slider16_changes.value = /*flareSettings*/ ctx[0].miIris.hueVariance;
    				add_flush_callback(() => updating_value_16 = false);
    			}

    			slider16.$set(slider16_changes);
    			const slider17_changes = {};

    			if (!updating_value_17 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_17 = true;
    				slider17_changes.value = /*flareSettings*/ ctx[0].miIris.seed;
    				add_flush_callback(() => updating_value_17 = false);
    			}

    			slider17.$set(slider17_changes);
    			const slider18_changes = {};

    			if (!updating_value_18 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_18 = true;
    				slider18_changes.value = /*flareSettings*/ ctx[0].miIris.anamorph;
    				add_flush_callback(() => updating_value_18 = false);
    			}

    			slider18.$set(slider18_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			transition_in(slider4.$$.fragment, local);
    			transition_in(slider5.$$.fragment, local);
    			transition_in(slider6.$$.fragment, local);
    			transition_in(slider7.$$.fragment, local);
    			transition_in(slider8.$$.fragment, local);
    			transition_in(slider9.$$.fragment, local);
    			transition_in(slider10.$$.fragment, local);
    			transition_in(slider11.$$.fragment, local);
    			transition_in(slider12.$$.fragment, local);
    			transition_in(slider13.$$.fragment, local);
    			transition_in(slider14.$$.fragment, local);
    			transition_in(slider15.$$.fragment, local);
    			transition_in(slider16.$$.fragment, local);
    			transition_in(slider17.$$.fragment, local);
    			transition_in(slider18.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			transition_out(slider4.$$.fragment, local);
    			transition_out(slider5.$$.fragment, local);
    			transition_out(slider6.$$.fragment, local);
    			transition_out(slider7.$$.fragment, local);
    			transition_out(slider8.$$.fragment, local);
    			transition_out(slider9.$$.fragment, local);
    			transition_out(slider10.$$.fragment, local);
    			transition_out(slider11.$$.fragment, local);
    			transition_out(slider12.$$.fragment, local);
    			transition_out(slider13.$$.fragment, local);
    			transition_out(slider14.$$.fragment, local);
    			transition_out(slider15.$$.fragment, local);
    			transition_out(slider16.$$.fragment, local);
    			transition_out(slider17.$$.fragment, local);
    			transition_out(slider18.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			destroy_component(slider1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_component(slider2, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t6);
    			destroy_component(slider3, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t8);
    			destroy_component(slider4, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t10);
    			destroy_component(slider5, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br5);
    			if (detaching) detach_dev(t12);
    			destroy_component(slider6, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(br6);
    			if (detaching) detach_dev(t14);
    			destroy_component(slider7, detaching);
    			if (detaching) detach_dev(t15);
    			if (detaching) detach_dev(br7);
    			if (detaching) detach_dev(t16);
    			destroy_component(slider8, detaching);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(br8);
    			if (detaching) detach_dev(t18);
    			destroy_component(slider9, detaching);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(br9);
    			if (detaching) detach_dev(t20);
    			destroy_component(slider10, detaching);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(br10);
    			if (detaching) detach_dev(t22);
    			destroy_component(slider11, detaching);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(br11);
    			if (detaching) detach_dev(t24);
    			destroy_component(slider12, detaching);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(br12);
    			if (detaching) detach_dev(t26);
    			destroy_component(slider13, detaching);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(br13);
    			if (detaching) detach_dev(t28);
    			destroy_component(slider14, detaching);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(br14);
    			if (detaching) detach_dev(t30);
    			destroy_component(slider15, detaching);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(br15);
    			if (detaching) detach_dev(t32);
    			destroy_component(slider16, detaching);
    			if (detaching) detach_dev(t33);
    			if (detaching) detach_dev(br16);
    			if (detaching) detach_dev(t34);
    			destroy_component(slider17, detaching);
    			if (detaching) detach_dev(t35);
    			if (detaching) detach_dev(br17);
    			if (detaching) detach_dev(t36);
    			destroy_component(slider18, detaching);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(br18);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(338:0) <Collapsible title={\\\"Multi-Iris\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (359:0) <Collapsible title={"Glow"}>
    function create_default_slot(ctx) {
    	let t0;
    	let slider0;
    	let updating_value;
    	let t1;
    	let br0;
    	let t2;
    	let slider1;
    	let updating_value_1;
    	let t3;
    	let br1;
    	let t4;
    	let slider2;
    	let updating_value_2;
    	let t5;
    	let br2;
    	let t6;
    	let slider3;
    	let updating_value_3;
    	let t7;
    	let br3;
    	let t8;
    	let slider4;
    	let updating_value_4;
    	let t9;
    	let br4;
    	let t10;
    	let slider5;
    	let updating_value_5;
    	let t11;
    	let br5;
    	let current;

    	function slider0_value_binding_5(value) {
    		/*slider0_value_binding_5*/ ctx[117](value);
    	}

    	let slider0_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].glow.alpha !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].glow.alpha;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_5));
    	slider0.$on("input", /*input_handler_51*/ ctx[118]);

    	function slider1_value_binding_5(value) {
    		/*slider1_value_binding_5*/ ctx[119](value);
    	}

    	let slider1_props = { min: 0, max: 360 };

    	if (/*flareSettings*/ ctx[0].glow.hue !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].glow.hue;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_5));
    	slider1.$on("input", /*input_handler_52*/ ctx[120]);

    	function slider2_value_binding_5(value) {
    		/*slider2_value_binding_5*/ ctx[121](value);
    	}

    	let slider2_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].glow.saturation !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].glow.saturation;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding_5));
    	slider2.$on("input", /*input_handler_53*/ ctx[122]);

    	function slider3_value_binding_5(value) {
    		/*slider3_value_binding_5*/ ctx[123](value);
    	}

    	let slider3_props = { min: 0, max: 1200 };

    	if (/*flareSettings*/ ctx[0].glow.radius !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].glow.radius;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding_5));
    	slider3.$on("input", /*input_handler_54*/ ctx[124]);

    	function slider4_value_binding_4(value) {
    		/*slider4_value_binding_4*/ ctx[125](value);
    	}

    	let slider4_props = { min: 0, max: 200 };

    	if (/*flareSettings*/ ctx[0].glow.softening !== void 0) {
    		slider4_props.value = /*flareSettings*/ ctx[0].glow.softening;
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, 'value', slider4_value_binding_4));
    	slider4.$on("input", /*input_handler_55*/ ctx[126]);

    	function slider5_value_binding_4(value) {
    		/*slider5_value_binding_4*/ ctx[127](value);
    	}

    	let slider5_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].glow.anamorph !== void 0) {
    		slider5_props.value = /*flareSettings*/ ctx[0].glow.anamorph;
    	}

    	slider5 = new Slider({ props: slider5_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider5, 'value', slider5_value_binding_4));
    	slider5.$on("input", /*input_handler_56*/ ctx[128]);

    	const block = {
    		c: function create() {
    			t0 = text("Alpha: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Hue: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Saturation: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Radius: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			t8 = text("\n    Softness: ");
    			create_component(slider4.$$.fragment);
    			t9 = space();
    			br4 = element("br");
    			t10 = text("\n    Anamorph: ");
    			create_component(slider5.$$.fragment);
    			t11 = space();
    			br5 = element("br");
    			add_location(br0, file, 359, 151, 23091);
    			add_location(br1, file, 360, 147, 23245);
    			add_location(br2, file, 361, 161, 23413);
    			add_location(br3, file, 362, 154, 23574);
    			add_location(br4, file, 363, 158, 23739);
    			add_location(br5, file, 364, 157, 23903);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(slider0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(slider1, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(slider2, target, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(slider3, target, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(slider4, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(slider5, target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, br5, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].glow.alpha;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].glow.hue;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].glow.saturation;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].glow.radius;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const slider4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_4 = true;
    				slider4_changes.value = /*flareSettings*/ ctx[0].glow.softening;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			slider4.$set(slider4_changes);
    			const slider5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_5 = true;
    				slider5_changes.value = /*flareSettings*/ ctx[0].glow.anamorph;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			slider5.$set(slider5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(slider3.$$.fragment, local);
    			transition_in(slider4.$$.fragment, local);
    			transition_in(slider5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(slider3.$$.fragment, local);
    			transition_out(slider4.$$.fragment, local);
    			transition_out(slider5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(slider0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t2);
    			destroy_component(slider1, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_component(slider2, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t6);
    			destroy_component(slider3, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t8);
    			destroy_component(slider4, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(t10);
    			destroy_component(slider5, detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(br5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(359:0) <Collapsible title={\\\"Glow\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (369:0) {#if startScreenVisible}
    function create_if_block(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let t1;
    	let input0;
    	let t2;
    	let br1;
    	let t3;
    	let input1;
    	let t4;
    	let br2;
    	let t5;
    	let button;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("PROGEN FLARES 2\n        ");
    			br0 = element("br");
    			t1 = text("\n        doc width ");
    			input0 = element("input");
    			t2 = space();
    			br1 = element("br");
    			t3 = text("\n        doc height");
    			input1 = element("input");
    			t4 = space();
    			br2 = element("br");
    			t5 = space();
    			button = element("button");
    			button.textContent = "go";
    			add_location(br0, file, 371, 8, 24028);
    			attr_dev(input0, "type", "number");
    			add_location(input0, file, 372, 18, 24053);
    			add_location(br1, file, 373, 8, 24129);
    			attr_dev(input1, "type", "number");
    			add_location(input1, file, 374, 18, 24154);
    			add_location(br2, file, 375, 8, 24231);
    			attr_dev(button, "class", "svelte-pentnw");
    			add_location(button, file, 376, 8, 24246);
    			attr_dev(div, "id", "startScreen");
    			attr_dev(div, "class", "svelte-pentnw");
    			add_location(div, file, 369, 4, 23962);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, t1);
    			append_dev(div, input0);
    			set_input_value(input0, /*flareSettings*/ ctx[0].dimensions.width);
    			append_dev(div, t2);
    			append_dev(div, br1);
    			append_dev(div, t3);
    			append_dev(div, input1);
    			set_input_value(input1, /*flareSettings*/ ctx[0].dimensions.height);
    			append_dev(div, t4);
    			append_dev(div, br2);
    			append_dev(div, t5);
    			append_dev(div, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[129]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[130]),
    					listen_dev(button, "click", /*onStart*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*flareSettings*/ 1 && to_number(input0.value) !== /*flareSettings*/ ctx[0].dimensions.width) {
    				set_input_value(input0, /*flareSettings*/ ctx[0].dimensions.width);
    			}

    			if (dirty[0] & /*flareSettings*/ 1 && to_number(input1.value) !== /*flareSettings*/ ctx[0].dimensions.height) {
    				set_input_value(input1, /*flareSettings*/ ctx[0].dimensions.height);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(369:0) {#if startScreenVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let button0;
    	let t1;
    	let br;
    	let t2;
    	let div2;
    	let div1;
    	let canvas;
    	let canvas_width_value;
    	let canvas_height_value;
    	let t3;
    	let div3;
    	let t4;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t8;
    	let div5;
    	let div4;
    	let presetpicker;
    	let t9;
    	let button1;
    	let t11;
    	let collapsible0;
    	let t12;
    	let collapsible1;
    	let t13;
    	let collapsible2;
    	let t14;
    	let collapsible3;
    	let t15;
    	let collapsible4;
    	let t16;
    	let collapsible5;
    	let t17;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	presetpicker = new PresetPicker({ $$inline: true });
    	presetpicker.$on("choose", /*choose_handler*/ ctx[13]);

    	collapsible0 = new Collapsible({
    			props: {
    				title: "Positioning",
    				collapsed: false,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible1 = new Collapsible({
    			props: {
    				title: "Hotspot",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible2 = new Collapsible({
    			props: {
    				title: "Streak",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible3 = new Collapsible({
    			props: {
    				title: "Ring",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible4 = new Collapsible({
    			props: {
    				title: "Multi-Iris",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible5 = new Collapsible({
    			props: {
    				title: "Glow",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*startScreenVisible*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Export";
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			canvas = element("canvas");
    			t3 = space();
    			div3 = element("div");
    			t4 = text("Preview quality\n");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "100%";
    			option1 = element("option");
    			option1.textContent = "50%";
    			option2 = element("option");
    			option2.textContent = "25%";
    			t8 = space();
    			div5 = element("div");
    			div4 = element("div");
    			create_component(presetpicker.$$.fragment);
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Save Preset";
    			t11 = space();
    			create_component(collapsible0.$$.fragment);
    			t12 = space();
    			create_component(collapsible1.$$.fragment);
    			t13 = space();
    			create_component(collapsible2.$$.fragment);
    			t14 = space();
    			create_component(collapsible3.$$.fragment);
    			t15 = space();
    			create_component(collapsible4.$$.fragment);
    			t16 = space();
    			create_component(collapsible5.$$.fragment);
    			t17 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(button0, "class", "svelte-pentnw");
    			add_location(button0, file, 264, 0, 13876);
    			add_location(br, file, 264, 80, 13956);
    			attr_dev(div0, "id", "exportPanel");
    			attr_dev(div0, "class", "svelte-pentnw");
    			add_location(div0, file, 263, 0, 13851);
    			attr_dev(canvas, "width", canvas_width_value = /*flareSettings*/ ctx[0].dimensions.width);
    			attr_dev(canvas, "height", canvas_height_value = /*flareSettings*/ ctx[0].dimensions.height);
    			attr_dev(canvas, "class", "svelte-pentnw");
    			add_location(canvas, file, 269, 8, 14036);
    			attr_dev(div1, "class", "" + (null_to_empty("centered") + " svelte-pentnw"));
    			add_location(div1, file, 268, 4, 14003);
    			attr_dev(div2, "id", "previewSection");
    			attr_dev(div2, "class", "svelte-pentnw");
    			add_location(div2, file, 267, 0, 13971);
    			option0.__value = 1;
    			option0.value = option0.__value;
    			add_location(option0, file, 276, 4, 14386);
    			option1.__value = 2;
    			option1.value = option1.__value;
    			add_location(option1, file, 277, 4, 14422);
    			option2.__value = 4;
    			option2.value = option2.__value;
    			add_location(option2, file, 278, 4, 14457);
    			if (/*flareSettings*/ ctx[0].downscaling === void 0) add_render_callback(() => /*select_change_handler*/ ctx[11].call(select));
    			add_location(select, file, 275, 0, 14276);
    			attr_dev(div3, "id", "sectionAbovePreview");
    			attr_dev(div3, "class", "svelte-pentnw");
    			add_location(div3, file, 273, 0, 14227);
    			attr_dev(button1, "style", "float: right;");
    			attr_dev(button1, "class", "svelte-pentnw");
    			add_location(button1, file, 294, 4, 14808);

    			attr_dev(div4, "style", `
    position: sticky;
    top: 0;
    width: 100%;
    background-color: var(--color-scheme-6);
    padding: 5px;
    box-sizing: border-box;
        border-bottom: 1px solid grey;
`);

    			add_location(div4, file, 284, 0, 14533);
    			attr_dev(div5, "id", "controlPanel");
    			attr_dev(div5, "class", "svelte-pentnw");
    			add_location(div5, file, 282, 0, 14506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, br);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, canvas);
    			/*canvas_binding*/ ctx[10](canvas);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t4);
    			append_dev(div3, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*flareSettings*/ ctx[0].downscaling);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			mount_component(presetpicker, div4, null);
    			append_dev(div4, t9);
    			append_dev(div4, button1);
    			append_dev(div5, t11);
    			mount_component(collapsible0, div5, null);
    			append_dev(div5, t12);
    			mount_component(collapsible1, div5, null);
    			append_dev(div5, t13);
    			mount_component(collapsible2, div5, null);
    			append_dev(div5, t14);
    			mount_component(collapsible3, div5, null);
    			append_dev(div5, t15);
    			mount_component(collapsible4, div5, null);
    			append_dev(div5, t16);
    			mount_component(collapsible5, div5, null);
    			insert_dev(target, t17, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[9], false, false, false),
    					action_destroyer(canvasClickDrag_1.call(null, canvas)),
    					listen_dev(canvas, "clickDrag", /*handleClickDrag*/ ctx[4], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[11]),
    					listen_dev(select, "change", /*change_handler*/ ctx[12], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*flareSettings*/ 1 && canvas_width_value !== (canvas_width_value = /*flareSettings*/ ctx[0].dimensions.width)) {
    				attr_dev(canvas, "width", canvas_width_value);
    			}

    			if (!current || dirty[0] & /*flareSettings*/ 1 && canvas_height_value !== (canvas_height_value = /*flareSettings*/ ctx[0].dimensions.height)) {
    				attr_dev(canvas, "height", canvas_height_value);
    			}

    			if (dirty[0] & /*flareSettings*/ 1) {
    				select_option(select, /*flareSettings*/ ctx[0].downscaling);
    			}

    			const collapsible0_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[4] & /*$$scope*/ 256) {
    				collapsible0_changes.$$scope = { dirty, ctx };
    			}

    			collapsible0.$set(collapsible0_changes);
    			const collapsible1_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[4] & /*$$scope*/ 256) {
    				collapsible1_changes.$$scope = { dirty, ctx };
    			}

    			collapsible1.$set(collapsible1_changes);
    			const collapsible2_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[4] & /*$$scope*/ 256) {
    				collapsible2_changes.$$scope = { dirty, ctx };
    			}

    			collapsible2.$set(collapsible2_changes);
    			const collapsible3_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[4] & /*$$scope*/ 256) {
    				collapsible3_changes.$$scope = { dirty, ctx };
    			}

    			collapsible3.$set(collapsible3_changes);
    			const collapsible4_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[4] & /*$$scope*/ 256) {
    				collapsible4_changes.$$scope = { dirty, ctx };
    			}

    			collapsible4.$set(collapsible4_changes);
    			const collapsible5_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[4] & /*$$scope*/ 256) {
    				collapsible5_changes.$$scope = { dirty, ctx };
    			}

    			collapsible5.$set(collapsible5_changes);

    			if (/*startScreenVisible*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*startScreenVisible*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(presetpicker.$$.fragment, local);
    			transition_in(collapsible0.$$.fragment, local);
    			transition_in(collapsible1.$$.fragment, local);
    			transition_in(collapsible2.$$.fragment, local);
    			transition_in(collapsible3.$$.fragment, local);
    			transition_in(collapsible4.$$.fragment, local);
    			transition_in(collapsible5.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(presetpicker.$$.fragment, local);
    			transition_out(collapsible0.$$.fragment, local);
    			transition_out(collapsible1.$$.fragment, local);
    			transition_out(collapsible2.$$.fragment, local);
    			transition_out(collapsible3.$$.fragment, local);
    			transition_out(collapsible4.$$.fragment, local);
    			transition_out(collapsible5.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			/*canvas_binding*/ ctx[10](null);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div5);
    			destroy_component(presetpicker);
    			destroy_component(collapsible0);
    			destroy_component(collapsible1);
    			destroy_component(collapsible2);
    			destroy_component(collapsible3);
    			destroy_component(collapsible4);
    			destroy_component(collapsible5);
    			if (detaching) detach_dev(t17);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	var flareComponents = {
    		hotspot: new SpotComponent(256, { deformationFrequency: 0.006 }),
    		streak: new SpotComponent(256, { deformationAmount: 0, intensity: 0 }),
    		ring: new RingComponent(256, { cropSize: 0 }),
    		miIris: new IrisComponent(256, { roundness: 20 }),
    		glow: new SpotComponent(256, { deformationAmount: 0, intensity: -50 })
    	};

    	var flareSettings = {
    		downscaling: 2,
    		dimensions: { width: 1920, height: 1080 },
    		positioning: { x: 960, y: 540, pivotX: 960, pivotY: 540 },
    		hotspot: {
    			radius: 500,
    			intensity: 5,
    			deformationAmount: 1.6,
    			deformationFrequency: 0.006,
    			deformationSeed: 1,
    			alpha: 100,
    			angle: 0,
    			hue: 200,
    			saturation: 100,
    			anamorph: 0
    		},
    		streak: {
    			thickness: 64,
    			width: 1600,
    			intensity: 5,
    			count: 1,
    			angle: 0,
    			shift: 36,
    			alpha: 100,
    			angle: 0,
    			hue: 200,
    			saturation: 100
    		},
    		ring: {
    			radius: 200,
    			thickness: 40,
    			blur: 5,
    			cropSize: 0,
    			cropHardness: 50,
    			alpha: 21,
    			hue: 200,
    			saturation: 100,
    			anamorph: 0
    		},
    		miIris: {
    			radius: 81,
    			sides: 5,
    			roundness: 20,
    			angle: 0,
    			fillAlpha: 25,
    			fringeAlpha: 50,
    			fringeSize: 10,
    			blur: 4,
    			countAway: 5,
    			countTowards: 12,
    			spread: 30,
    			sizeVariance: 40,
    			perspective: 100,
    			alphaVariance: 50,
    			seed: 123,
    			hue: 200,
    			saturation: 100,
    			hueVariance: 30,
    			anamorph: 0
    		},
    		glow: {
    			radius: 960,
    			alpha: 80,
    			softening: 70,
    			hue: 200,
    			saturation: 100,
    			anamorph: 0
    		}
    	};

    	var baseCanvas;

    	function renderFlare(
    		renderHotspot = false,
    	renderStreak = false,
    	renderRing = false,
    	renderMI = false,
    	renderGlow = false
    	) {
    		if (renderHotspot) {
    			flareComponents.hotspot.radius = Math.floor(flareSettings.hotspot.radius / flareSettings.downscaling);
    			flareComponents.hotspot.options.intensity = flareSettings.hotspot.intensity / flareSettings.downscaling;
    			flareComponents.hotspot.options.deformationAmount = flareSettings.hotspot.deformationAmount;
    			flareComponents.hotspot.options.deformationFrequency = flareSettings.hotspot.deformationFrequency;
    			flareComponents.hotspot.options.deformationSeed = flareSettings.hotspot.deformationSeed;
    			flareComponents.hotspot.options.hue = flareSettings.hotspot.hue;
    			flareComponents.hotspot.options.saturation = flareSettings.hotspot.saturation;
    			flareComponents.hotspot.render();
    		}

    		if (renderStreak) {
    			flareComponents.streak.radius = Math.floor(flareSettings.streak.thickness * 2 / flareSettings.downscaling);
    			flareComponents.streak.options.intensity = flareSettings.streak.intensity / flareSettings.downscaling;
    			flareComponents.streak.options.hue = flareSettings.streak.hue;
    			flareComponents.streak.options.saturation = flareSettings.streak.saturation;
    			flareComponents.streak.render();
    			flareComponents.streakLeftHalf = new HalfComponent(flareComponents.streak.canvas, flareSettings.streak.width * 2, flareSettings.streak.thickness * 2, true, false);
    			flareComponents.streakRightHalf = new HalfComponent(flareComponents.streak.canvas, flareSettings.streak.width * 2, flareSettings.streak.thickness * 2, false, true);
    		}

    		if (renderRing) {
    			flareComponents.ring.radius = Math.floor(flareSettings.ring.radius / flareSettings.downscaling);
    			flareComponents.ring.options.thickness = flareSettings.ring.thickness / flareSettings.downscaling;
    			flareComponents.ring.options.blur = flareSettings.ring.blur / flareSettings.downscaling;
    			flareComponents.ring.options.cropSize = flareSettings.ring.cropSize / flareSettings.downscaling;
    			flareComponents.ring.options.cropHardness = flareSettings.ring.cropHardness;
    			flareComponents.ring.options.hue = flareSettings.ring.hue;
    			flareComponents.ring.options.saturation = flareSettings.ring.saturation;
    			flareComponents.ring.render();
    		}

    		if (renderMI) {
    			flareComponents.miIris.radius = Math.floor(flareSettings.miIris.radius / flareSettings.downscaling);
    			flareComponents.miIris.options.sides = flareSettings.miIris.sides;
    			flareComponents.miIris.options.roundness = flareSettings.miIris.roundness;
    			flareComponents.miIris.options.fillAlpha = flareSettings.miIris.fillAlpha;
    			flareComponents.miIris.options.fringeAlpha = flareSettings.miIris.fringeAlpha;
    			flareComponents.miIris.options.fringeSize = Math.floor(flareSettings.miIris.fringeSize / flareSettings.downscaling);
    			flareComponents.miIris.options.blur = Math.floor(flareSettings.miIris.blur / flareSettings.downscaling);
    			flareComponents.miIris.options.angle = flareSettings.miIris.angle;
    			flareComponents.miIris.options.hue = flareSettings.miIris.hue;
    			flareComponents.miIris.options.saturation = flareSettings.miIris.saturation;
    			flareComponents.miIris.render();
    		}

    		if (renderGlow) {
    			flareComponents.glow.radius = Math.floor(flareSettings.glow.radius / flareSettings.downscaling);
    			flareComponents.glow.options.intensity = Math.floor(-flareSettings.glow.softening / flareSettings.downscaling);
    			flareComponents.glow.options.hue = flareSettings.glow.hue;
    			flareComponents.glow.options.saturation = flareSettings.glow.saturation;
    			flareComponents.glow.render();
    		}

    		var ctx = baseCanvas.getContext("2d");
    		ctx.restore();
    		ctx.save();
    		ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    		ctx.fillStyle = "black";
    		ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
    		drawComponent_1(ctx, flareComponents.hotspot, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2 * (1 - flareSettings.hotspot.anamorph / 100), flareSettings.hotspot.angle, flareSettings.hotspot.alpha);
    		var streakAngle = flareSettings.streak.angle;

    		for (var i = 0; i < flareSettings.streak.count; i++) {
    			var streakOffset = (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.streak.shift / 100;
    			if (flareSettings.streak.count > 1) streakOffset = flareSettings.streak.shift * (i % 2 == 0 ? -1 : 1) / 100 * flareSettings.streak.width;
    			drawComponent_1(ctx, flareComponents.streakRightHalf, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width + streakOffset, flareSettings.streak.thickness, streakAngle, flareSettings.streak.alpha);
    			drawComponent_1(ctx, flareComponents.streakLeftHalf, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width - streakOffset, flareSettings.streak.thickness, streakAngle, flareSettings.streak.alpha);
    			streakAngle += 180 / flareSettings.streak.count;
    		}

    		drawComponent_1(ctx, flareComponents.ring, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.ring.radius * 2, flareSettings.ring.radius * 2 * (1 - flareSettings.ring.anamorph / 100), 0, flareSettings.ring.alpha);
    		var miRng = seedrandom(flareSettings.miIris.seed);

    		for (var i = 1; i < flareSettings.miIris.countTowards; i++) {
    			var irisPosition = {
    				x: flareSettings.positioning.x + i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
    				y: flareSettings.positioning.y + i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100
    			};

    			var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
    			irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
    			drawComponent_1(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale * (1 - flareSettings.miIris.anamorph / 100), 0, 100 - flareSettings.miIris.alphaVariance * miRng(), flareSettings.miIris.hueVariance * (miRng() * 2 - 1));
    		}

    		for (var i = 1; i < flareSettings.miIris.countAway; i++) {
    			var irisPosition = {
    				x: flareSettings.positioning.x - i * (flareSettings.positioning.pivotX - flareSettings.positioning.x) * flareSettings.miIris.spread / 100,
    				y: flareSettings.positioning.y - i * (flareSettings.positioning.pivotY - flareSettings.positioning.y) * flareSettings.miIris.spread / 100
    			};

    			var irisScale = 1 + (miRng() - 0.5) * 2 * flareSettings.miIris.sizeVariance / 100;
    			irisScale -= (1 - i / flareSettings.miIris.countTowards) * flareSettings.miIris.perspective / 100;
    			drawComponent_1(ctx, flareComponents.miIris, irisPosition.x, irisPosition.y, flareSettings.miIris.radius * 2 * irisScale, flareSettings.miIris.radius * 2 * irisScale * (1 - flareSettings.miIris.anamorph / 100), 0, 100 - flareSettings.miIris.alphaVariance * miRng(), flareSettings.miIris.hueVariance * (miRng() * 2 - 1));
    		}

    		drawComponent_1(ctx, flareComponents.glow, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.glow.radius * 2, flareSettings.glow.radius * 2 * (1 - flareSettings.glow.anamorph / 100), 0, flareSettings.glow.alpha);
    	}

    	window.onload = function () {
    		renderFlare(true, true, true, true, true);
    	};

    	function handleClickDrag(e) {
    		//console.log(e.detail);
    		$$invalidate(0, flareSettings.positioning.x = e.detail.x, flareSettings);

    		$$invalidate(0, flareSettings.positioning.y = e.detail.y, flareSettings);
    		renderFlare();
    	}

    	function createDownloadLink() {
    		var initialDownscaling = flareSettings.downscaling;
    		$$invalidate(0, flareSettings.downscaling = 1, flareSettings);
    		renderFlare(true, true, true, true, true);
    		var a = document.createElement("a");
    		a.href = baseCanvas.toDataURL();
    		a.download = "ProgenFlares2-flare.png";
    		$$invalidate(0, flareSettings.downscaling = initialDownscaling, flareSettings);
    		renderFlare(true, true, true, true, true);
    		return a;
    	}

    	function createPresetSaveLink() {
    		var fileContents = JSON.stringify({
    			hotspot: flareSettings.hotspot,
    			streak: flareSettings.streak,
    			ring: flareSettings.ring,
    			miIris: flareSettings.miIris,
    			glow: flareSettings.glow
    		});

    		var textFile = new Blob([fileContents], { "type": "application/json" });
    		var a = document.createElement("a");
    		a.href = URL.createObjectURL(textFile);
    		a.download = "ProgenFlares2-preset.pgf2";
    		return a;
    	}

    	function setPreset(presetData) {
    		for (var keyi in presetData) {
    			if (!flareSettings[keyi]) $$invalidate(0, flareSettings[keyi] = {}, flareSettings);

    			for (var keyj in presetData[keyi]) {
    				$$invalidate(0, flareSettings[keyi][keyj] = presetData[keyi][keyj], flareSettings);
    			}
    		}

    		renderFlare(true, true, true, true, true);
    	}

    	var startScreenVisible = true;

    	function onStart() {
    		//setPreset({"hotspot":{"radius":595,"intensity":19,"deformationAmount":1.5,"deformationFrequency":0.01,"deformationSeed":998,"alpha":100,"angle":0,"hue":39,"saturation":88,"anamorph":0},"streak":{"thickness":121,"width":2435,"intensity":-25,"count":1,"angle":0,"shift":48,"alpha":100,"hue":216,"saturation":100},"ring":{"radius":300,"thickness":50,"blur":4,"cropSize":0,"cropHardness":50,"alpha":0,"hue":200,"saturation":100,"anamorph":0},"miIris":{"radius":81,"sides":6,"roundness":32,"angle":0,"fillAlpha":12,"fringeAlpha":25,"fringeSize":10,"blur":4,"countAway":5,"countTowards":12,"spread":30,"sizeVariance":40,"perspective":100,"alphaVariance":50,"seed":333,"hue":39,"saturation":100,"hueVariance":40,"anamorph":0},"glow":{"radius":999,"alpha":25,"softening":0,"hue":23,"saturation":100,"anamorph":0}});
    		$$invalidate(0, flareSettings.positioning.pivotX = flareSettings.dimensions.width / 2, flareSettings);

    		$$invalidate(0, flareSettings.positioning.pivotY = flareSettings.dimensions.height / 2, flareSettings);
    		$$invalidate(0, flareSettings.positioning.x = flareSettings.dimensions.width * 2 / 5, flareSettings);
    		$$invalidate(0, flareSettings.positioning.y = flareSettings.dimensions.height * 2 / 5, flareSettings);
    		renderFlare(true, true, true, true, true);
    		$$invalidate(2, startScreenVisible = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = function () {
    		createDownloadLink().click();
    	};

    	function canvas_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			baseCanvas = $$value;
    			$$invalidate(1, baseCanvas);
    		});
    	}

    	function select_change_handler() {
    		flareSettings.downscaling = select_value(this);
    		$$invalidate(0, flareSettings);
    	}

    	const change_handler = function () {
    		renderFlare(true, true, true);
    	};

    	const choose_handler = function (e) {
    		setPreset(e.detail);
    	};

    	const click_handler_1 = function () {
    		createPresetSaveLink().click();
    	};

    	function slider0_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.positioning.x, value)) {
    			flareSettings.positioning.x = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler = function () {
    		renderFlare();
    	};

    	function slider1_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.positioning.y, value)) {
    			flareSettings.positioning.y = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_1 = function () {
    		renderFlare();
    	};

    	function slider2_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.positioning.pivotX, value)) {
    			flareSettings.positioning.pivotX = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_2 = function () {
    		renderFlare();
    	};

    	function slider3_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.positioning.pivotY, value)) {
    			flareSettings.positioning.pivotY = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_3 = function () {
    		renderFlare();
    	};

    	function slider0_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.alpha, value)) {
    			flareSettings.hotspot.alpha = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_4 = function () {
    		renderFlare(true);
    	};

    	function slider1_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.angle, value)) {
    			flareSettings.hotspot.angle = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_5 = function () {
    		renderFlare(true);
    	};

    	function slider2_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.hue, value)) {
    			flareSettings.hotspot.hue = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_6 = function () {
    		renderFlare(true);
    	};

    	function slider3_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.saturation, value)) {
    			flareSettings.hotspot.saturation = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_7 = function () {
    		renderFlare(true);
    	};

    	function slider4_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.radius, value)) {
    			flareSettings.hotspot.radius = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_8 = function () {
    		renderFlare(true);
    	};

    	function slider5_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.intensity, value)) {
    			flareSettings.hotspot.intensity = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_9 = function () {
    		renderFlare(true);
    	};

    	function slider6_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.deformationFrequency, value)) {
    			flareSettings.hotspot.deformationFrequency = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_10 = function () {
    		renderFlare(true);
    	};

    	function slider7_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.deformationAmount, value)) {
    			flareSettings.hotspot.deformationAmount = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_11 = function () {
    		renderFlare(true);
    	};

    	function slider8_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.deformationSeed, value)) {
    			flareSettings.hotspot.deformationSeed = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_12 = function () {
    		renderFlare(true);
    	};

    	function slider9_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.anamorph, value)) {
    			flareSettings.hotspot.anamorph = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_13 = function () {
    		renderFlare(true);
    	};

    	function slider0_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.alpha, value)) {
    			flareSettings.streak.alpha = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_14 = function () {
    		renderFlare(false, true);
    	};

    	function slider1_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.angle, value)) {
    			flareSettings.streak.angle = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_15 = function () {
    		renderFlare(false, true);
    	};

    	function slider2_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.hue, value)) {
    			flareSettings.streak.hue = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_16 = function () {
    		renderFlare(false, true);
    	};

    	function slider3_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.saturation, value)) {
    			flareSettings.streak.saturation = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_17 = function () {
    		renderFlare(false, true);
    	};

    	function slider4_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.thickness, value)) {
    			flareSettings.streak.thickness = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_18 = function () {
    		renderFlare(false, true);
    	};

    	function slider5_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.width, value)) {
    			flareSettings.streak.width = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_19 = function () {
    		renderFlare(false, true);
    	};

    	function slider6_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.intensity, value)) {
    			flareSettings.streak.intensity = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_20 = function () {
    		renderFlare(false, true);
    	};

    	function slider7_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.count, value)) {
    			flareSettings.streak.count = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_21 = function () {
    		renderFlare(false, true);
    	};

    	function slider8_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.shift, value)) {
    			flareSettings.streak.shift = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_22 = function () {
    		renderFlare(false, true);
    	};

    	function slider0_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.alpha, value)) {
    			flareSettings.ring.alpha = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_23 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider1_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.hue, value)) {
    			flareSettings.ring.hue = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_24 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider2_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.saturation, value)) {
    			flareSettings.ring.saturation = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_25 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider3_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.radius, value)) {
    			flareSettings.ring.radius = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_26 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider4_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.thickness, value)) {
    			flareSettings.ring.thickness = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_27 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider5_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.blur, value)) {
    			flareSettings.ring.blur = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_28 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider6_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.cropSize, value)) {
    			flareSettings.ring.cropSize = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_29 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider7_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.cropHardness, value)) {
    			flareSettings.ring.cropHardness = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_30 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider8_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.anamorph, value)) {
    			flareSettings.ring.anamorph = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_31 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider0_value_binding_4(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.fillAlpha, value)) {
    			flareSettings.miIris.fillAlpha = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_32 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider1_value_binding_4(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.fringeAlpha, value)) {
    			flareSettings.miIris.fringeAlpha = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_33 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider2_value_binding_4(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.angle, value)) {
    			flareSettings.miIris.angle = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_34 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider3_value_binding_4(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.hue, value)) {
    			flareSettings.miIris.hue = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_35 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider4_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.saturation, value)) {
    			flareSettings.miIris.saturation = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_36 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider5_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.radius, value)) {
    			flareSettings.miIris.radius = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_37 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider6_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.sides, value)) {
    			flareSettings.miIris.sides = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_38 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider7_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.roundness, value)) {
    			flareSettings.miIris.roundness = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_39 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider8_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.fringeSize, value)) {
    			flareSettings.miIris.fringeSize = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_40 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider9_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.blur, value)) {
    			flareSettings.miIris.blur = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_41 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider10_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.countTowards, value)) {
    			flareSettings.miIris.countTowards = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_42 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider11_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.countAway, value)) {
    			flareSettings.miIris.countAway = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_43 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider12_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.spread, value)) {
    			flareSettings.miIris.spread = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_44 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider13_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.sizeVariance, value)) {
    			flareSettings.miIris.sizeVariance = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_45 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider14_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.perspective, value)) {
    			flareSettings.miIris.perspective = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_46 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider15_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.alphaVariance, value)) {
    			flareSettings.miIris.alphaVariance = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_47 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider16_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.hueVariance, value)) {
    			flareSettings.miIris.hueVariance = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_48 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider17_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.seed, value)) {
    			flareSettings.miIris.seed = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_49 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider18_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.miIris.anamorph, value)) {
    			flareSettings.miIris.anamorph = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_50 = function () {
    		renderFlare(false, false, false, true);
    	};

    	function slider0_value_binding_5(value) {
    		if ($$self.$$.not_equal(flareSettings.glow.alpha, value)) {
    			flareSettings.glow.alpha = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_51 = function () {
    		renderFlare(false, false, false, false, true);
    	};

    	function slider1_value_binding_5(value) {
    		if ($$self.$$.not_equal(flareSettings.glow.hue, value)) {
    			flareSettings.glow.hue = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_52 = function () {
    		renderFlare(false, false, false, false, true);
    	};

    	function slider2_value_binding_5(value) {
    		if ($$self.$$.not_equal(flareSettings.glow.saturation, value)) {
    			flareSettings.glow.saturation = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_53 = function () {
    		renderFlare(false, false, false, false, true);
    	};

    	function slider3_value_binding_5(value) {
    		if ($$self.$$.not_equal(flareSettings.glow.radius, value)) {
    			flareSettings.glow.radius = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_54 = function () {
    		renderFlare(false, false, false, false, true);
    	};

    	function slider4_value_binding_4(value) {
    		if ($$self.$$.not_equal(flareSettings.glow.softening, value)) {
    			flareSettings.glow.softening = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_55 = function () {
    		renderFlare(false, false, false, false, true);
    	};

    	function slider5_value_binding_4(value) {
    		if ($$self.$$.not_equal(flareSettings.glow.anamorph, value)) {
    			flareSettings.glow.anamorph = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_56 = function () {
    		renderFlare(false, false, false, false, true);
    	};

    	function input0_input_handler() {
    		flareSettings.dimensions.width = to_number(this.value);
    		$$invalidate(0, flareSettings);
    	}

    	function input1_input_handler() {
    		flareSettings.dimensions.height = to_number(this.value);
    		$$invalidate(0, flareSettings);
    	}

    	$$self.$capture_state = () => ({
    		Collapsible,
    		colorvibrance: colorvibrance_1,
    		SpotComponent,
    		RingComponent,
    		Slider,
    		drawComponent: drawComponent_1,
    		canvasClickDrag: canvasClickDrag_1,
    		IrisComponent,
    		seedrandom,
    		HalfComponent,
    		PresetPicker,
    		fade,
    		flareComponents,
    		flareSettings,
    		baseCanvas,
    		renderFlare,
    		handleClickDrag,
    		createDownloadLink,
    		createPresetSaveLink,
    		setPreset,
    		startScreenVisible,
    		onStart
    	});

    	$$self.$inject_state = $$props => {
    		if ('flareComponents' in $$props) flareComponents = $$props.flareComponents;
    		if ('flareSettings' in $$props) $$invalidate(0, flareSettings = $$props.flareSettings);
    		if ('baseCanvas' in $$props) $$invalidate(1, baseCanvas = $$props.baseCanvas);
    		if ('startScreenVisible' in $$props) $$invalidate(2, startScreenVisible = $$props.startScreenVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		flareSettings,
    		baseCanvas,
    		startScreenVisible,
    		renderFlare,
    		handleClickDrag,
    		createDownloadLink,
    		createPresetSaveLink,
    		setPreset,
    		onStart,
    		click_handler,
    		canvas_binding,
    		select_change_handler,
    		change_handler,
    		choose_handler,
    		click_handler_1,
    		slider0_value_binding,
    		input_handler,
    		slider1_value_binding,
    		input_handler_1,
    		slider2_value_binding,
    		input_handler_2,
    		slider3_value_binding,
    		input_handler_3,
    		slider0_value_binding_1,
    		input_handler_4,
    		slider1_value_binding_1,
    		input_handler_5,
    		slider2_value_binding_1,
    		input_handler_6,
    		slider3_value_binding_1,
    		input_handler_7,
    		slider4_value_binding,
    		input_handler_8,
    		slider5_value_binding,
    		input_handler_9,
    		slider6_value_binding,
    		input_handler_10,
    		slider7_value_binding,
    		input_handler_11,
    		slider8_value_binding,
    		input_handler_12,
    		slider9_value_binding,
    		input_handler_13,
    		slider0_value_binding_2,
    		input_handler_14,
    		slider1_value_binding_2,
    		input_handler_15,
    		slider2_value_binding_2,
    		input_handler_16,
    		slider3_value_binding_2,
    		input_handler_17,
    		slider4_value_binding_1,
    		input_handler_18,
    		slider5_value_binding_1,
    		input_handler_19,
    		slider6_value_binding_1,
    		input_handler_20,
    		slider7_value_binding_1,
    		input_handler_21,
    		slider8_value_binding_1,
    		input_handler_22,
    		slider0_value_binding_3,
    		input_handler_23,
    		slider1_value_binding_3,
    		input_handler_24,
    		slider2_value_binding_3,
    		input_handler_25,
    		slider3_value_binding_3,
    		input_handler_26,
    		slider4_value_binding_2,
    		input_handler_27,
    		slider5_value_binding_2,
    		input_handler_28,
    		slider6_value_binding_2,
    		input_handler_29,
    		slider7_value_binding_2,
    		input_handler_30,
    		slider8_value_binding_2,
    		input_handler_31,
    		slider0_value_binding_4,
    		input_handler_32,
    		slider1_value_binding_4,
    		input_handler_33,
    		slider2_value_binding_4,
    		input_handler_34,
    		slider3_value_binding_4,
    		input_handler_35,
    		slider4_value_binding_3,
    		input_handler_36,
    		slider5_value_binding_3,
    		input_handler_37,
    		slider6_value_binding_3,
    		input_handler_38,
    		slider7_value_binding_3,
    		input_handler_39,
    		slider8_value_binding_3,
    		input_handler_40,
    		slider9_value_binding_1,
    		input_handler_41,
    		slider10_value_binding,
    		input_handler_42,
    		slider11_value_binding,
    		input_handler_43,
    		slider12_value_binding,
    		input_handler_44,
    		slider13_value_binding,
    		input_handler_45,
    		slider14_value_binding,
    		input_handler_46,
    		slider15_value_binding,
    		input_handler_47,
    		slider16_value_binding,
    		input_handler_48,
    		slider17_value_binding,
    		input_handler_49,
    		slider18_value_binding,
    		input_handler_50,
    		slider0_value_binding_5,
    		input_handler_51,
    		slider1_value_binding_5,
    		input_handler_52,
    		slider2_value_binding_5,
    		input_handler_53,
    		slider3_value_binding_5,
    		input_handler_54,
    		slider4_value_binding_4,
    		input_handler_55,
    		slider5_value_binding_4,
    		input_handler_56,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
