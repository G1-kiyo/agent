class NodeOperator {
    tree: any[];
    constructor(tree) {
        this.tree = [...tree]
    }
    hasKeyAndPush(node, newNode, parentKey, compareKey, operateKey, depth) {
        const stack = [node]
        let currentDepth = 1
        while (stack.length > 0 && (!depth || currentDepth <= depth)) {
            for (let i = 0; i < stack.length; i++) {
                const current = stack.pop();
                console.log("current", current, parentKey, newNode[parentKey])
                if (current[compareKey] === newNode[parentKey]) {
                    current[operateKey].push(newNode)
                    return true
                } else {
                    stack.push(...(current[operateKey] || []))
                }
            }
            currentDepth++

        }
        return false
    }
    hasKeyAndDelete(node, id, compareKey, operateKey, depth) {
        // 比较key值是否一致，一致的话就看他是否为根元素，如果不是，那就找他的父亲，然后从父亲的子元素根据key找到他的排序，然后踢掉它，如果是根元素，那就从tree外层把它扔掉
        // 如何找到父亲-->在找儿子的时候同时记录父亲
        let currentDepth = 1
        const stack = [{ node, parentNode: null }]
        while (stack.length > 0 && (!depth || currentDepth <= depth)) {
            for (let i = 0; i < stack.length; i++) {
                const current = stack.pop();
                const cNode = current.node
                const pNode = current.parentNode
                console.log("current", current,compareKey,operateKey)
                if (cNode[compareKey] === id) {
                    const pList = pNode ? pNode[operateKey] : this.tree
                    const ind = pList.findIndex((node) => node[compareKey] === id)
                    pList.splice(ind, 1)
                    return true
                } else {
                    const children = cNode[operateKey]
                    console.log("children",children)
                    if (Array.isArray(children) && children.length > 0) {
                        const buildNodeList = children.map((c) => ({ node: c, parentNode: cNode }))
                        stack.push(...buildNodeList)
                    }
                }
            }
            currentDepth++
        }
        return false
    }
    hasKeyAndUpdate(node, id, updateFn, compareKey, operateKey, depth) {
        const stack = [node]
        let currentDepth = 1
        while (stack.length > 0 && (!depth || currentDepth <= depth)) {
            for (let i = 0; i < stack.length; i++) {
                const current = stack.pop();
                console.log("current", current)
                if (current[compareKey] === id) {
                    updateFn && updateFn(current)
                    return true
                } else {
                    stack.push(...(current[operateKey] || []))
                }
            }
            currentDepth++
        }
        return false
    }
    add(newNode, parentKey, compareKey, operateKey, depth) {
        if (newNode[parentKey]) {
            for (const originItem of this.tree) {
                if (this.hasKeyAndPush(originItem, newNode, parentKey, compareKey, operateKey, depth)) return this.tree;
            }
        }
        this.tree.push(newNode)
        return this.tree
    }
    remove(id, compareKey, operateKey, depth) {
        for (const originItem of this.tree) {
            if (this.hasKeyAndDelete(originItem, id, compareKey, operateKey, depth)) return this.tree;
        }
        return this.tree
    }
    update(id, updateFn, compareKey, operateKey, depth) {
        for (const originItem of this.tree) {
            if (this.hasKeyAndUpdate(originItem, id, updateFn, compareKey, operateKey, depth)) return this.tree;
        }
        return this.tree
    }
}

export default NodeOperator