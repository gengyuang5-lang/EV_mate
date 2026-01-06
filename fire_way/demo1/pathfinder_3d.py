"""
3D A*路径规划算法
用于在建筑物内部进行三维立体导航
"""
import heapq
from typing import List, Tuple, Optional, Dict
from building_map import BuildingMap


class Node:
    """A*算法中的节点"""
    
    def __init__(self, x: int, y: int, z: int, g: float = 0, h: float = 0, 
                 parent: Optional['Node'] = None):
        self.x = x
        self.y = y
        self.z = z
        self.g = g  # 从起点到当前节点的实际代价
        self.h = h  # 从当前节点到终点的启发式估计代价
        self.f = g + h  # 总代价
        self.parent = parent
    
    def __lt__(self, other):
        """用于优先队列比较"""
        if self.f != other.f:
            return self.f < other.f
        return self.h < other.h
    
    def __eq__(self, other):
        """节点相等性比较"""
        if isinstance(other, Node):
            return (self.x, self.y, self.z) == (other.x, other.y, other.z)
        return False
    
    def __hash__(self):
        """节点哈希值"""
        return hash((self.x, self.y, self.z))
    
    def get_position(self) -> Tuple[int, int, int]:
        """获取节点位置"""
        return (self.x, self.y, self.z)


class PathFinder3D:
    """3D A*路径规划器"""
    
    def __init__(self, building_map: BuildingMap):
        """
        初始化路径规划器
        
        Args:
            building_map: 建筑物地图对象
        """
        self.map = building_map
    
    def heuristic(self, pos1: Tuple[int, int, int], 
                  pos2: Tuple[int, int, int]) -> float:
        """
        启发式函数：使用欧几里得距离
        
        Args:
            pos1: 位置1 (x, y, z)
            pos2: 位置2 (x, y, z)
        
        Returns:
            估计距离
        """
        dx = pos1[0] - pos2[0]
        dy = pos1[1] - pos2[1]
        dz = pos1[2] - pos2[2]
        return (dx**2 + dy**2 + dz**2) ** 0.5
    
    def heuristic_manhattan(self, pos1: Tuple[int, int, int], 
                            pos2: Tuple[int, int, int]) -> float:
        """
        曼哈顿距离启发式（可选，更快但可能不够准确）
        
        Args:
            pos1: 位置1 (x, y, z)
            pos2: 位置2 (x, y, z)
        
        Returns:
            曼哈顿距离
        """
        return (abs(pos1[0] - pos2[0]) + 
                abs(pos1[1] - pos2[1]) + 
                abs(pos1[2] - pos2[2]))
    
    def get_cost(self, pos1: Tuple[int, int, int], 
                 pos2: Tuple[int, int, int]) -> float:
        """
        计算从pos1到pos2的移动代价
        
        Args:
            pos1: 起始位置
            pos2: 目标位置
        
        Returns:
            移动代价
        """
        dx = abs(pos1[0] - pos2[0])
        dy = abs(pos1[1] - pos2[1])
        dz = abs(pos1[2] - pos2[2])
        
        # 水平移动代价为1，垂直移动（楼层变化）代价为2
        if dy == 0:
            # 同一楼层
            if dx == 0 or dz == 0:
                return 1.0  # 直线移动
            else:
                return 1.414  # 对角线移动（√2）
        else:
            # 跨楼层移动，代价更高
            return 2.0 + (dx + dz) * 0.1
    
    def find_path(self, start: Tuple[int, int, int], 
                  goal: Tuple[int, int, int],
                  allow_diagonal: bool = True) -> Optional[List[Tuple[int, int, int]]]:
        """
        使用A*算法查找路径
        
        Args:
            start: 起始位置 (x, y, z)
            goal: 目标位置 (x, y, z)
            allow_diagonal: 是否允许对角线移动
        
        Returns:
            路径点列表，如果找不到路径则返回None
        """
        # 检查起点和终点是否可通行
        if not self.map.is_walkable(*start):
            print(f"错误：起点 {start} 不可通行")
            return None
        
        if not self.map.is_walkable(*goal):
            print(f"错误：终点 {goal} 不可通行")
            return None
        
        # 初始化
        start_node = Node(*start, g=0, h=self.heuristic(start, goal))
        goal_node = Node(*goal)
        
        open_set = [start_node]  # 优先队列
        heapq.heapify(open_set)
        closed_set = set()  # 已访问节点
        open_dict = {start_node.get_position(): start_node}  # 快速查找
        
        while open_set:
            # 获取f值最小的节点
            current = heapq.heappop(open_set)
            current_pos = current.get_position()
            
            # 从open_dict中移除
            if current_pos in open_dict:
                del open_dict[current_pos]
            
            # 如果到达目标
            if current_pos == goal:
                # 重构路径
                path = []
                node = current
                while node is not None:
                    path.append(node.get_position())
                    node = node.parent
                return path[::-1]  # 反转路径
            
            closed_set.add(current_pos)
            
            # 检查所有邻居
            neighbors = self.map.get_neighbors(*current_pos, allow_diagonal)
            for neighbor_pos in neighbors:
                if neighbor_pos in closed_set:
                    continue
                
                # 计算从起点到邻居的代价
                tentative_g = current.g + self.get_cost(current_pos, neighbor_pos)
                
                # 检查是否在开放列表中
                if neighbor_pos in open_dict:
                    neighbor_node = open_dict[neighbor_pos]
                    if tentative_g >= neighbor_node.g:
                        continue
                    # 更新节点
                    neighbor_node.g = tentative_g
                    neighbor_node.f = tentative_g + neighbor_node.h
                    neighbor_node.parent = current
                    # 重新堆化（简单方法：重新添加）
                    heapq.heappush(open_set, neighbor_node)
                else:
                    # 新节点
                    h = self.heuristic(neighbor_pos, goal)
                    neighbor_node = Node(*neighbor_pos, g=tentative_g, h=h, 
                                        parent=current)
                    heapq.heappush(open_set, neighbor_node)
                    open_dict[neighbor_pos] = neighbor_node
        
        # 未找到路径
        return None
    
    def find_path_multiple_goals(self, start: Tuple[int, int, int],
                                 goals: List[Tuple[int, int, int]],
                                 allow_diagonal: bool = True) -> Optional[List[Tuple[int, int, int]]]:
        """
        查找经过多个目标点的路径（最近邻贪心方法）
        
        Args:
            start: 起始位置
            goals: 目标位置列表
            allow_diagonal: 是否允许对角线移动
        
        Returns:
            完整路径，如果找不到则返回None
        """
        if not goals:
            return None
        
        current = start
        full_path = [start]
        remaining_goals = goals.copy()
        
        while remaining_goals:
            # 找到最近的目标
            min_distance = float('inf')
            nearest_goal = None
            nearest_index = -1
            
            for i, goal in enumerate(remaining_goals):
                distance = self.heuristic(current, goal)
                if distance < min_distance:
                    min_distance = distance
                    nearest_goal = goal
                    nearest_index = i
            
            # 规划到最近目标的路径
            path = self.find_path(current, nearest_goal, allow_diagonal)
            if path is None:
                print(f"无法到达目标 {nearest_goal}")
                return None
            
            # 添加到完整路径（跳过第一个点，因为已经在路径中）
            full_path.extend(path[1:])
            current = nearest_goal
            remaining_goals.pop(nearest_index)
        
        return full_path

