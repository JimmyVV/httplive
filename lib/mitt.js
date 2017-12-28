export default function mitt() {
	let all = Object.create(null);

	return {
		
		on(type, handler) {
			(all[type] || (all[type] = [])).push(handler);
		},

		/**
		 * Remove an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
		 * @param  {Function} handler Handler function to remove
		 * @memberOf mitt
		 */
		off(type, handler) {
			if (all[type]) {
				all[type].splice(all[type].indexOf(handler) >>> 0, 1);
			}
		},

		emit(type, ...evt) {
			(all[type] || []).slice().map((handler) => { handler(...evt); });
			(all['*'] || []).slice().map((handler) => { handler(type, ...evt); });
		}
	};
}