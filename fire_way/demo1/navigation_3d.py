"""
建筑物内三维立体导航系统
整合地图和路径规划功能
"""
from typing import List, Tuple, Optional, Dict
from building_map import BuildingMap
from pathfinder_3d import PathFinder3D


class Navigation3D:
    """3D导航系统主类"""
    
    def __init__(self, width: int, height: int, depth: int):
        """
        初始化导航系统
        
        Args:
            width: 地图宽度（X轴）
            height: 地图高度（Y轴，楼层数）
            depth: 地图深度（Z轴）
        """
        self.building_map = BuildingMap(width, height, depth)
        self.pathfinder = PathFinder3D(self.building_map)
        self.landmarks: Dict[str, Tuple[int, int, int]] = {}
    
    def add_landmark(self, name: str, position: Tuple[int, int, int]):
        """
        添加地标点
        
        Args:
            name: 地标名称（如"电梯A"、"会议室1"等）
            position: 地标位置 (x, y, z)
        """
        if self.building_map.is_walkable(*position):
            self.landmarks[name] = position
        else:
            print(f"警告：地标 {name} 的位置 {position} 不可通行")
    
    def get_landmark(self, name: str) -> Optional[Tuple[int, int, int]]:
        """获取地标位置"""
        return self.landmarks.get(name)
    
    def navigate(self, start: Tuple[int, int, int], 
                 goal: Tuple[int, int, int],
                 allow_diagonal: bool = True) -> Optional[List[Tuple[int, int, int]]]:
        """
        导航从起点到终点
        
        Args:
            start: 起始位置 (x, y, z)
            goal: 目标位置 (x, y, z)
            allow_diagonal: 是否允许对角线移动
        
        Returns:
            路径点列表，如果找不到路径则返回None
        """
        return self.pathfinder.find_path(start, goal, allow_diagonal)
    
    def navigate_to_landmark(self, start: Tuple[int, int, int], 
                             landmark_name: str,
                             allow_diagonal: bool = True) -> Optional[List[Tuple[int, int, int]]]:
        """
        导航到地标
        
        Args:
            start: 起始位置
            landmark_name: 地标名称
            allow_diagonal: 是否允许对角线移动
        
        Returns:
            路径点列表，如果找不到路径则返回None
        """
        goal = self.get_landmark(landmark_name)
        if goal is None:
            print(f"错误：找不到地标 '{landmark_name}'")
            return None
        return self.navigate(start, goal, allow_diagonal)
    
    def navigate_through_landmarks(self, start: Tuple[int, int, int],
                                   landmark_names: List[str],
                                   allow_diagonal: bool = True) -> Optional[List[Tuple[int, int, int]]]:
        """
        依次导航经过多个地标
        
        Args:
            start: 起始位置
            landmark_names: 地标名称列表
            allow_diagonal: 是否允许对角线移动
        
        Returns:
            完整路径，如果找不到则返回None
        """
        goals = []
        for name in landmark_names:
            pos = self.get_landmark(name)
            if pos is None:
                print(f"错误：找不到地标 '{name}'")
                return None
            goals.append(pos)
        
        return self.pathfinder.find_path_multiple_goals(start, goals, allow_diagonal)
    
    def get_path_length(self, path: List[Tuple[int, int, int]]) -> float:
        """
        计算路径长度
        
        Args:
            path: 路径点列表
        
        Returns:
            路径总长度
        """
        if not path or len(path) < 2:
            return 0.0
        
        total_length = 0.0
        for i in range(len(path) - 1):
            total_length += self.pathfinder.get_cost(path[i], path[i + 1])
        
        return total_length
    
    def get_path_info(self, path: List[Tuple[int, int, int]]) -> Dict:
        """
        获取路径详细信息
        
        Args:
            path: 路径点列表
        
        Returns:
            包含路径信息的字典
        """
        if not path:
            return {
                'length': 0,
                'steps': 0,
                'floor_changes': 0,
                'floors_visited': set()
            }
        
        length = self.get_path_length(path)
        steps = len(path) - 1
        floor_changes = 0
        floors_visited = set()
        
        for i in range(len(path) - 1):
            current_floor = path[i][1]
            next_floor = path[i + 1][1]
            floors_visited.add(current_floor)
            floors_visited.add(next_floor)
            if current_floor != next_floor:
                floor_changes += 1
        
        return {
            'length': length,
            'steps': steps,
            'floor_changes': floor_changes,
            'floors_visited': sorted(floors_visited),
            'start': path[0],
            'end': path[-1]
        }
    
    def visualize_path(self, path: List[Tuple[int, int, int]], 
                      show_all_floors: bool = False):
        """
        可视化路径
        
        Args:
            path: 路径点列表
            show_all_floors: 是否显示所有楼层的路径
        """
        if not path:
            print("路径为空")
            return
        
        info = self.get_path_info(path)
        print("\n=== 路径信息 ===")
        print(f"起点: {info['start']}")
        print(f"终点: {info['end']}")
        print(f"路径长度: {info['length']:.2f}")
        print(f"步数: {info['steps']}")
        print(f"楼层变化次数: {info['floor_changes']}")
        print(f"经过的楼层: {info['floors_visited']}")
        print(f"\n路径点 ({len(path)} 个):")
        for i, pos in enumerate(path):
            print(f"  {i+1}. {pos}")
        
        # 显示路径在每层的投影
        if show_all_floors:
            floors_to_show = info['floors_visited']
        else:
            floors_to_show = [path[0][1], path[-1][1]]  # 只显示起点和终点楼层
        
        for floor in floors_to_show:
            floor_path = [p for p in path if p[1] == floor]
            if floor_path:
                self.building_map.visualize_2d_slice(floor, floor_path)

