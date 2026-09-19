//给定一个链表，每个节点包含一个额外增加的随机指针，该指针可以指向链表中的任何节点或空节点。

// 要求返回这个链表的 深拷贝。

/*
输入：
{"$id":"1","next":{"$id":"2","next":null,"random":{"$ref":"2"},"val":2},"random":{"$ref":"2"},"val":1}

解释：
节点 1 的值是 1，它的下一个指针和随机指针都指向节点 2 。
节点 2 的值是 2，它的下一个指针指向 null，随机指针指向它自己。
*/

class TreeNode{
    id = ""
    next = null
    random = null
    val = null
    constructor(id,next,random,val){
        this.id = id
        this.next = next
        this.random = random
        this.val = val
    }
}
// 创建一个head 和 current，遍历原始链表，移动current
// random存储的是引用，不能直接赋值，否则拿的就是原始链表的节点
// 用map存储每一个遍历到的节点，然后再去checkrandom是否在map里，是就直接引用，不是就新建一个，初始为null保存在map，然后直接引用
// 等到遍历到的节点id是匹配的，然后再领出来重新赋值
const copyLinkedList = (node) => {
    const head = new TreeNode()
    let current = head
    const map = new Map()
    while(node){
        map.set(node.id,node)
        let currentNode = new TreeNode()
        currentNode.id = node.id
        currentNode.next = JSON.parse(JSON.stringify(node.next))
        currentNode.val = node.val
        const randomNode = node.random
        if(map.has(randomNode.id)){
            currentNode.random = map.get(randomNode.id)
        }else{
            map.set(randomNode.id,{})
        }
        
        current.next = currentNode
        current = current.next
        node = node.next
    }
    return head
}

