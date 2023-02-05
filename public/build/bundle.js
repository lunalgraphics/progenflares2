
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
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
    const file$2 = "src/Collapsible.svelte";

    // (24:0) {#if (!collapsed)}
    function create_if_block(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$2, 24, 4, 505);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[8](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
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
    			/*div_binding*/ ctx[8](null);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(24:0) {#if (!collapsed)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let b;
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*collapsed*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			b = element("b");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			set_style(b, "user-select", "none");
    			add_location(b, file$2, 21, 0, 383);
    			add_location(br, file$2, 22, 0, 475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			append_dev(b, t0);
    			/*b_binding*/ ctx[7](b);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(b, "mousedown", /*toggleCollapse*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (!/*collapsed*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 1) {
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
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    			/*b_binding*/ ctx[7](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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

    	function b_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			nameTag = $$value;
    			$$invalidate(2, nameTag);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contents = $$value;
    			$$invalidate(3, contents);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$props.collapsed);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		current: current$1,
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
    		if ('nameTag' in $$props) $$invalidate(2, nameTag = $$props.nameTag);
    		if ('contents' in $$props) $$invalidate(3, contents = $$props.contents);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		collapsed,
    		title,
    		nameTag,
    		contents,
    		toggleCollapse,
    		$$scope,
    		slots,
    		b_binding,
    		div_binding
    	];
    }

    class Collapsible extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { title: 1, collapsed: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapsible",
    			options,
    			id: create_fragment$2.name
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
                baseFrequency: [this.options.deformationFrequency, 0]
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
    const file$1 = "src/Slider.svelte";

    function create_fragment$1(ctx) {
    	let input0;
    	let t;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", /*min*/ ctx[1]);
    			attr_dev(input0, "max", /*max*/ ctx[2]);
    			input0.value = /*value*/ ctx[0];
    			attr_dev(input0, "step", /*step*/ ctx[3]);
    			attr_dev(input0, "class", "svelte-n1z3wa");
    			add_location(input0, file$1, 27, 0, 476);
    			attr_dev(input1, "type", "number");
    			input1.value = /*value*/ ctx[0];
    			attr_dev(input1, "step", /*step*/ ctx[3]);
    			attr_dev(input1, "class", "svelte-n1z3wa");
    			add_location(input1, file$1, 28, 0, 615);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input0, anchor);
    			/*input0_binding*/ ctx[8](input0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, input1, anchor);
    			/*input1_binding*/ ctx[9](input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*updateValues*/ ctx[6], false, false, false),
    					listen_dev(input0, "change", /*onChange*/ ctx[7], false, false, false),
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

    			if (dirty & /*value*/ 1) {
    				prop_dev(input0, "value", /*value*/ ctx[0]);
    			}

    			if (dirty & /*step*/ 8) {
    				attr_dev(input0, "step", /*step*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1 && input1.value !== /*value*/ ctx[0]) {
    				prop_dev(input1, "value", /*value*/ ctx[0]);
    			}

    			if (dirty & /*step*/ 8) {
    				attr_dev(input1, "step", /*step*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input0);
    			/*input0_binding*/ ctx[8](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input1);
    			/*input1_binding*/ ctx[9](null);
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
    	validate_slots('Slider', slots, []);
    	const dispatch = createEventDispatcher();
    	let { value } = $$props;
    	let { min = 0 } = $$props;
    	let { max } = $$props;
    	let { step = 1 } = $$props;
    	let numberElement;
    	let rangeElement;

    	function updateValues() {
    		$$invalidate(0, value = parseFloat(this.value));
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

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			rangeElement = $$value;
    			$$invalidate(5, rangeElement);
    		});
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
    		current,
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
    		input0_binding,
    		input1_binding
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0, min: 1, max: 2, step: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$1.name
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

    function drawComponent(ctx, component, centerX, centerY, width, height, angle=0, opacity=100) {
        if (width <= 0 || height <= 0 || opacity <= 0) return;

        ctx.restore();
        ctx.save();
        
        ctx.translate(centerX, centerY);
        ctx.rotate(angle * Math.PI / 180); // degrees
        ctx.globalAlpha = opacity / 100;
        ctx.globalCompositeOperation = "screen";
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

    /* src/App.svelte generated by Svelte v3.55.1 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (111:0) <Collapsible title={"positioning"} collapsed={false}>
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
    	let current;

    	function slider0_value_binding(value) {
    		/*slider0_value_binding*/ ctx[7](value);
    	}

    	let slider0_props = { min: 0, max: 1920 };

    	if (/*flareSettings*/ ctx[0].positioning.x !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].positioning.x;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding));
    	slider0.$on("input", /*input_handler*/ ctx[8]);

    	function slider1_value_binding(value) {
    		/*slider1_value_binding*/ ctx[9](value);
    	}

    	let slider1_props = { min: 0, max: 1080 };

    	if (/*flareSettings*/ ctx[0].positioning.y !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].positioning.y;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding));
    	slider1.$on("input", /*input_handler_1*/ ctx[10]);

    	function slider2_value_binding(value) {
    		/*slider2_value_binding*/ ctx[11](value);
    	}

    	let slider2_props = { min: 0, max: 1920 };

    	if (/*flareSettings*/ ctx[0].positioning.pivotX !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].positioning.pivotX;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding));
    	slider2.$on("input", /*input_handler_2*/ ctx[12]);

    	function slider3_value_binding(value) {
    		/*slider3_value_binding*/ ctx[13](value);
    	}

    	let slider3_props = { min: 0, max: 1080 };

    	if (/*flareSettings*/ ctx[0].positioning.pivotY !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].positioning.pivotY;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding));
    	slider3.$on("input", /*input_handler_3*/ ctx[14]);

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
    			add_location(br0, file, 111, 126, 4443);
    			add_location(br1, file, 112, 126, 4576);
    			add_location(br2, file, 113, 137, 4720);
    			add_location(br3, file, 114, 137, 4864);
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

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].positioning.x;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].positioning.y;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].positioning.pivotX;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

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
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(111:0) <Collapsible title={\\\"positioning\\\"} collapsed={false}>",
    		ctx
    	});

    	return block;
    }

    // (117:0) <Collapsible title={"hi"}>
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
    	let current;

    	function slider0_value_binding_1(value) {
    		/*slider0_value_binding_1*/ ctx[15](value);
    	}

    	let slider0_props = { min: 0, max: 900 };

    	if (/*flareSettings*/ ctx[0].hotspot.radius !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].hotspot.radius;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_1));
    	slider0.$on("input", /*input_handler_4*/ ctx[16]);

    	function slider1_value_binding_1(value) {
    		/*slider1_value_binding_1*/ ctx[17](value);
    	}

    	let slider1_props = { min: 0, max: 50 };

    	if (/*flareSettings*/ ctx[0].hotspot.intensity !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].hotspot.intensity;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_1));
    	slider1.$on("input", /*input_handler_5*/ ctx[18]);

    	const block = {
    		c: function create() {
    			t0 = text("Size: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Intensity: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			add_location(br0, file, 117, 133, 5046);
    			add_location(br1, file, 118, 140, 5193);
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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].hotspot.radius;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].hotspot.intensity;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(117:0) <Collapsible title={\\\"hi\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (121:0) <Collapsible title={"anamorphic streak"}>
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
    	let current;

    	function slider0_value_binding_2(value) {
    		/*slider0_value_binding_2*/ ctx[19](value);
    	}

    	let slider0_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].streak.thickness !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].streak.thickness;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_2));
    	slider0.$on("input", /*input_handler_6*/ ctx[20]);

    	function slider1_value_binding_2(value) {
    		/*slider1_value_binding_2*/ ctx[21](value);
    	}

    	let slider1_props = { min: 0, max: 3210 };

    	if (/*flareSettings*/ ctx[0].streak.width !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].streak.width;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_2));
    	slider1.$on("input", /*input_handler_7*/ ctx[22]);

    	function slider2_value_binding_1(value) {
    		/*slider2_value_binding_1*/ ctx[23](value);
    	}

    	let slider2_props = { min: 0, max: 50 };

    	if (/*flareSettings*/ ctx[0].streak.intensity !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].streak.intensity;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding_1));
    	slider2.$on("input", /*input_handler_8*/ ctx[24]);

    	function slider3_value_binding_1(value) {
    		/*slider3_value_binding_1*/ ctx[25](value);
    	}

    	let slider3_props = { min: 1, max: 16 };

    	if (/*flareSettings*/ ctx[0].streak.count !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].streak.count;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding_1));
    	slider3.$on("input", /*input_handler_9*/ ctx[26]);

    	const block = {
    		c: function create() {
    			t0 = text("Thickness: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Length: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Intensity: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Starring: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			add_location(br0, file, 121, 147, 5404);
    			add_location(br1, file, 122, 141, 5552);
    			add_location(br2, file, 123, 146, 5705);
    			add_location(br3, file, 124, 141, 5853);
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

    			if (!updating_value && dirty[0] & /*flareSettings*/ 1) {
    				updating_value = true;
    				slider0_changes.value = /*flareSettings*/ ctx[0].streak.thickness;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].streak.width;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].streak.intensity;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].streak.count;
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(121:0) <Collapsible title={\\\"anamorphic streak\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (127:0) <Collapsible title={"ring thing"}>
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

    	function slider0_value_binding_3(value) {
    		/*slider0_value_binding_3*/ ctx[27](value);
    	}

    	let slider0_props = { min: 0, max: 810 };

    	if (/*flareSettings*/ ctx[0].ring.radius !== void 0) {
    		slider0_props.value = /*flareSettings*/ ctx[0].ring.radius;
    	}

    	slider0 = new Slider({ props: slider0_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider0, 'value', slider0_value_binding_3));
    	slider0.$on("input", /*input_handler_10*/ ctx[28]);

    	function slider1_value_binding_3(value) {
    		/*slider1_value_binding_3*/ ctx[29](value);
    	}

    	let slider1_props = { min: 0, max: 500 };

    	if (/*flareSettings*/ ctx[0].ring.thickness !== void 0) {
    		slider1_props.value = /*flareSettings*/ ctx[0].ring.thickness;
    	}

    	slider1 = new Slider({ props: slider1_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider1, 'value', slider1_value_binding_3));
    	slider1.$on("input", /*input_handler_11*/ ctx[30]);

    	function slider2_value_binding_2(value) {
    		/*slider2_value_binding_2*/ ctx[31](value);
    	}

    	let slider2_props = { min: 0, max: 50 };

    	if (/*flareSettings*/ ctx[0].ring.blur !== void 0) {
    		slider2_props.value = /*flareSettings*/ ctx[0].ring.blur;
    	}

    	slider2 = new Slider({ props: slider2_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider2, 'value', slider2_value_binding_2));
    	slider2.$on("input", /*input_handler_12*/ ctx[32]);

    	function slider3_value_binding_2(value) {
    		/*slider3_value_binding_2*/ ctx[33](value);
    	}

    	let slider3_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].ring.alpha !== void 0) {
    		slider3_props.value = /*flareSettings*/ ctx[0].ring.alpha;
    	}

    	slider3 = new Slider({ props: slider3_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider3, 'value', slider3_value_binding_2));
    	slider3.$on("input", /*input_handler_13*/ ctx[34]);

    	function slider4_value_binding(value) {
    		/*slider4_value_binding*/ ctx[35](value);
    	}

    	let slider4_props = { min: 0, max: 400 };

    	if (/*flareSettings*/ ctx[0].ring.cropSize !== void 0) {
    		slider4_props.value = /*flareSettings*/ ctx[0].ring.cropSize;
    	}

    	slider4 = new Slider({ props: slider4_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider4, 'value', slider4_value_binding));
    	slider4.$on("input", /*input_handler_14*/ ctx[36]);

    	function slider5_value_binding(value) {
    		/*slider5_value_binding*/ ctx[37](value);
    	}

    	let slider5_props = { min: 0, max: 100 };

    	if (/*flareSettings*/ ctx[0].ring.cropHardness !== void 0) {
    		slider5_props.value = /*flareSettings*/ ctx[0].ring.cropHardness;
    	}

    	slider5 = new Slider({ props: slider5_props, $$inline: true });
    	binding_callbacks.push(() => bind(slider5, 'value', slider5_value_binding));
    	slider5.$on("input", /*input_handler_15*/ ctx[38]);

    	const block = {
    		c: function create() {
    			t0 = text("Radius: ");
    			create_component(slider0.$$.fragment);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n    Thickness: ");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			br1 = element("br");
    			t4 = text("\n    Softness: ");
    			create_component(slider2.$$.fragment);
    			t5 = space();
    			br2 = element("br");
    			t6 = text("\n    Alpha: ");
    			create_component(slider3.$$.fragment);
    			t7 = space();
    			br3 = element("br");
    			t8 = text("\n    Crop Size: ");
    			create_component(slider4.$$.fragment);
    			t9 = space();
    			br4 = element("br");
    			t10 = text("\n    Crop Hardness: ");
    			create_component(slider5.$$.fragment);
    			t11 = space();
    			br5 = element("br");
    			add_location(br0, file, 127, 146, 6056);
    			add_location(br1, file, 128, 152, 6215);
    			add_location(br2, file, 129, 145, 6367);
    			add_location(br3, file, 130, 144, 6518);
    			add_location(br4, file, 131, 151, 6676);
    			add_location(br5, file, 132, 159, 6842);
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
    				slider0_changes.value = /*flareSettings*/ ctx[0].ring.radius;
    				add_flush_callback(() => updating_value = false);
    			}

    			slider0.$set(slider0_changes);
    			const slider1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_1 = true;
    				slider1_changes.value = /*flareSettings*/ ctx[0].ring.thickness;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			slider1.$set(slider1_changes);
    			const slider2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_2 = true;
    				slider2_changes.value = /*flareSettings*/ ctx[0].ring.blur;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			slider2.$set(slider2_changes);
    			const slider3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_3 = true;
    				slider3_changes.value = /*flareSettings*/ ctx[0].ring.alpha;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			slider3.$set(slider3_changes);
    			const slider4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_4 = true;
    				slider4_changes.value = /*flareSettings*/ ctx[0].ring.cropSize;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			slider4.$set(slider4_changes);
    			const slider5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*flareSettings*/ 1) {
    				updating_value_5 = true;
    				slider5_changes.value = /*flareSettings*/ ctx[0].ring.cropHardness;
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
    		source: "(127:0) <Collapsible title={\\\"ring thing\\\"}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let canvas;
    	let t0;
    	let br0;
    	let t1;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t5;
    	let br1;
    	let t6;
    	let collapsible0;
    	let t7;
    	let collapsible1;
    	let t8;
    	let collapsible2;
    	let t9;
    	let collapsible3;
    	let current;
    	let mounted;
    	let dispose;

    	collapsible0 = new Collapsible({
    			props: {
    				title: "positioning",
    				collapsed: false,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible1 = new Collapsible({
    			props: {
    				title: "hi",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible2 = new Collapsible({
    			props: {
    				title: "anamorphic streak",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	collapsible3 = new Collapsible({
    			props: {
    				title: "ring thing",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			canvas = element("canvas");
    			t0 = space();
    			br0 = element("br");
    			t1 = text("\n\nPreview quality\n");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "100%";
    			option1 = element("option");
    			option1.textContent = "50%";
    			option2 = element("option");
    			option2.textContent = "25%";
    			t5 = space();
    			br1 = element("br");
    			t6 = space();
    			create_component(collapsible0.$$.fragment);
    			t7 = space();
    			create_component(collapsible1.$$.fragment);
    			t8 = space();
    			create_component(collapsible2.$$.fragment);
    			t9 = space();
    			create_component(collapsible3.$$.fragment);
    			attr_dev(canvas, "width", 1920);
    			attr_dev(canvas, "height", 1080);
    			attr_dev(canvas, "class", "svelte-13xw3n8");
    			add_location(canvas, file, 98, 0, 3883);
    			attr_dev(br0, "uh", "");
    			add_location(br0, file, 100, 0, 4003);
    			option0.__value = 1;
    			option0.value = option0.__value;
    			add_location(option0, file, 104, 4, 4140);
    			option1.__value = 2;
    			option1.value = option1.__value;
    			add_location(option1, file, 105, 4, 4176);
    			option2.__value = 4;
    			option2.value = option2.__value;
    			add_location(option2, file, 106, 4, 4211);
    			if (/*flareSettings*/ ctx[0].downscaling === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file, 103, 0, 4030);
    			attr_dev(br1, "uh", "");
    			add_location(br1, file, 108, 0, 4252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas, anchor);
    			/*canvas_binding*/ ctx[4](canvas);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			select_option(select, /*flareSettings*/ ctx[0].downscaling);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(collapsible0, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(collapsible1, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(collapsible2, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(collapsible3, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(canvasClickDrag_1.call(null, canvas)),
    					listen_dev(canvas, "clickDrag", /*handleClickDrag*/ ctx[3], false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(select, "change", /*change_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*flareSettings*/ 1) {
    				select_option(select, /*flareSettings*/ ctx[0].downscaling);
    			}

    			const collapsible0_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[1] & /*$$scope*/ 512) {
    				collapsible0_changes.$$scope = { dirty, ctx };
    			}

    			collapsible0.$set(collapsible0_changes);
    			const collapsible1_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[1] & /*$$scope*/ 512) {
    				collapsible1_changes.$$scope = { dirty, ctx };
    			}

    			collapsible1.$set(collapsible1_changes);
    			const collapsible2_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[1] & /*$$scope*/ 512) {
    				collapsible2_changes.$$scope = { dirty, ctx };
    			}

    			collapsible2.$set(collapsible2_changes);
    			const collapsible3_changes = {};

    			if (dirty[0] & /*flareSettings*/ 1 | dirty[1] & /*$$scope*/ 512) {
    				collapsible3_changes.$$scope = { dirty, ctx };
    			}

    			collapsible3.$set(collapsible3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(collapsible0.$$.fragment, local);
    			transition_in(collapsible1.$$.fragment, local);
    			transition_in(collapsible2.$$.fragment, local);
    			transition_in(collapsible3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(collapsible0.$$.fragment, local);
    			transition_out(collapsible1.$$.fragment, local);
    			transition_out(collapsible2.$$.fragment, local);
    			transition_out(collapsible3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas);
    			/*canvas_binding*/ ctx[4](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t6);
    			destroy_component(collapsible0, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(collapsible1, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(collapsible2, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(collapsible3, detaching);
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
    		ring: new RingComponent(256, { cropSize: 0 })
    	};

    	var flareSettings = {
    		downscaling: 2,
    		positioning: { x: 960, y: 540, pivotX: 960, pivotY: 540 },
    		hotspot: { radius: 500, intensity: 5 },
    		streak: {
    			thickness: 64,
    			width: 1600,
    			intensity: 5,
    			count: 1,
    			angle: 0
    		},
    		ring: {
    			radius: 400,
    			thickness: 50,
    			blur: 3,
    			cropSize: 0,
    			cropHardness: 50,
    			alpha: 50
    		}
    	};

    	var baseCanvas;

    	function renderFlare(renderHotspot = false, renderStreak = false, renderRing = false) {
    		if (renderHotspot) {
    			flareComponents.hotspot.radius = Math.floor(flareSettings.hotspot.radius / flareSettings.downscaling);
    			flareComponents.hotspot.options.intensity = flareSettings.hotspot.intensity / flareSettings.downscaling;
    			flareComponents.hotspot.render();
    		}

    		if (renderStreak) {
    			flareComponents.streak.radius = Math.floor(flareSettings.streak.thickness / flareSettings.downscaling);
    			flareComponents.streak.options.intensity = flareSettings.streak.intensity / flareSettings.downscaling;
    			flareComponents.streak.render();
    		}

    		if (renderRing) {
    			flareComponents.ring.radius = Math.floor(flareSettings.ring.radius / flareSettings.downscaling);
    			flareComponents.ring.options.thickness = flareSettings.ring.thickness / flareSettings.downscaling;
    			flareComponents.ring.options.blur = flareSettings.ring.blur / flareSettings.downscaling;
    			flareComponents.ring.options.cropSize = flareSettings.ring.cropSize / flareSettings.downscaling;
    			flareComponents.ring.options.cropHardness = flareSettings.ring.cropHardness;
    			flareComponents.ring.render();
    		}

    		var ctx = baseCanvas.getContext("2d");
    		ctx.restore();
    		ctx.save();
    		ctx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
    		ctx.fillStyle = "black";
    		ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
    		drawComponent_1(ctx, flareComponents.hotspot, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.hotspot.radius * 2, flareSettings.hotspot.radius * 2);
    		var streakAngle = flareSettings.streak.angle;

    		for (var i = 0; i < flareSettings.streak.count; i++) {
    			drawComponent_1(ctx, flareComponents.streak, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.streak.width, flareSettings.streak.thickness, streakAngle);
    			streakAngle += 180 / flareSettings.streak.count;
    		}

    		drawComponent_1(ctx, flareComponents.ring, flareSettings.positioning.x, flareSettings.positioning.y, flareSettings.ring.radius, flareSettings.ring.radius, 0, flareSettings.ring.alpha);
    	}

    	window.onload = function () {
    		renderFlare(true, true, true);
    	};

    	function handleClickDrag(e) {
    		console.log(e.detail);
    		$$invalidate(0, flareSettings.positioning.x = e.detail.x, flareSettings);
    		$$invalidate(0, flareSettings.positioning.y = e.detail.y, flareSettings);
    		renderFlare();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

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
    		if ($$self.$$.not_equal(flareSettings.hotspot.radius, value)) {
    			flareSettings.hotspot.radius = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_4 = function () {
    		renderFlare(true);
    	};

    	function slider1_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.hotspot.intensity, value)) {
    			flareSettings.hotspot.intensity = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_5 = function () {
    		renderFlare(true);
    	};

    	function slider0_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.thickness, value)) {
    			flareSettings.streak.thickness = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_6 = function () {
    		renderFlare(false, true);
    	};

    	function slider1_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.width, value)) {
    			flareSettings.streak.width = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_7 = function () {
    		renderFlare(false, true);
    	};

    	function slider2_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.intensity, value)) {
    			flareSettings.streak.intensity = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_8 = function () {
    		renderFlare(false, true);
    	};

    	function slider3_value_binding_1(value) {
    		if ($$self.$$.not_equal(flareSettings.streak.count, value)) {
    			flareSettings.streak.count = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_9 = function () {
    		renderFlare(false, true);
    	};

    	function slider0_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.radius, value)) {
    			flareSettings.ring.radius = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_10 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider1_value_binding_3(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.thickness, value)) {
    			flareSettings.ring.thickness = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_11 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider2_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.blur, value)) {
    			flareSettings.ring.blur = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_12 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider3_value_binding_2(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.alpha, value)) {
    			flareSettings.ring.alpha = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_13 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider4_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.cropSize, value)) {
    			flareSettings.ring.cropSize = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_14 = function () {
    		renderFlare(false, false, true);
    	};

    	function slider5_value_binding(value) {
    		if ($$self.$$.not_equal(flareSettings.ring.cropHardness, value)) {
    			flareSettings.ring.cropHardness = value;
    			$$invalidate(0, flareSettings);
    		}
    	}

    	const input_handler_15 = function () {
    		renderFlare(false, false, true);
    	};

    	$$self.$capture_state = () => ({
    		Collapsible,
    		colorvibrance: colorvibrance_1,
    		SpotComponent,
    		RingComponent,
    		Slider,
    		drawComponent: drawComponent_1,
    		canvasClickDrag: canvasClickDrag_1,
    		flareComponents,
    		flareSettings,
    		baseCanvas,
    		renderFlare,
    		handleClickDrag
    	});

    	$$self.$inject_state = $$props => {
    		if ('flareComponents' in $$props) flareComponents = $$props.flareComponents;
    		if ('flareSettings' in $$props) $$invalidate(0, flareSettings = $$props.flareSettings);
    		if ('baseCanvas' in $$props) $$invalidate(1, baseCanvas = $$props.baseCanvas);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		flareSettings,
    		baseCanvas,
    		renderFlare,
    		handleClickDrag,
    		canvas_binding,
    		select_change_handler,
    		change_handler,
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
    		slider0_value_binding_2,
    		input_handler_6,
    		slider1_value_binding_2,
    		input_handler_7,
    		slider2_value_binding_1,
    		input_handler_8,
    		slider3_value_binding_1,
    		input_handler_9,
    		slider0_value_binding_3,
    		input_handler_10,
    		slider1_value_binding_3,
    		input_handler_11,
    		slider2_value_binding_2,
    		input_handler_12,
    		slider3_value_binding_2,
    		input_handler_13,
    		slider4_value_binding,
    		input_handler_14,
    		slider5_value_binding,
    		input_handler_15
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

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
